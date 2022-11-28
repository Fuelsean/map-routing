import { Location, BoundingBox, RoutedAddress } from '../classes';

const handleLocationError = (address, err) => {
    console.warn("Error validating address", address, err);
    let l = Location.withError(err);
    l.Address = address;
    l.Found = false;
    return l;
}

const validateAddress = async (address) => {
    console.log("validating", address);
    if (address && address.trim()?.length > 0) {
        const location = await (fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=HbeZkfxVyOubAiNNEVA2yZSb79i96XyW&location=${address}&boundingBox=34.023071,-97.893677,32.238359,-95.861206`)
            .then(response => {
                if (!response.ok) {
                    return handleLocationError(address, { status: response.status, message: `Error validating address ${address}.` });
                }
                return response.json().then(body => {
                    let loc = new Location();
                    loc.Address = address;
                    if (body && body.results && body.results.length > 0) {
                        if (body.results[0].locations?.length > 0) {
                            let matched = body.results[0].locations[0];
                            if (matched.street?.length > 2) {
                                if (BoundingBox.ValidateCoordinates(matched.latLng?.lat, matched.latLng?.lng)) {
                                    loc.Found = true;
                                    loc.Match = `${matched.street}, ${matched.adminArea5}, ${matched.adminArea3}, ${matched.postalCode}`;
                                }
                            }
                        }
                    }
                    return loc;
                });
            }))
            .catch((err) => {
                return handleLocationError(address, err);
            });
        return Promise.resolve(location);
    }
    return Promise.resolve();
};
const ERROR_ROUTING_HEADER = "Error routing addresses"
const routeAddressList = async (list) => {
    const items = list.filter(a => a.Found === true);
    if (!(items?.length > 0)) {
        return Promise.resolve({ error: { header: ERROR_ROUTING_HEADER, message: "No valid addresses" }});
    }
    //https://here-b2c.aws.mapquest.com/directions/v2/optimizedroute?timeType=1
    const request = {
        locations: items.map(i => i.Match),
        options: {
            narrativeType: "none"
        }
    };
    const response = await (fetch("https://here-b2c.aws.mapquest.com/directions/v2/optimizedroute?timeType=1", {
        method: "POST",
        cache: "no-cache",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    }).catch(err => {
        console.log(err);
        return {
            header: ERROR_ROUTING_HEADER,
            message: "Call to MapQuest failed",
            error: err
        }
    }));

    if (response?.error) {
        return Promise.resolve({ error: response });
    }

    const body = await response?.json();
    if (!response?.ok) {
        return Promise.resolve({
            error: {
                header: ERROR_ROUTING_HEADER,
                message: `${response?.status} error routing addresses.`,
                err: await response?.json()
            }
        });
    }

    let routed = []
    if (body?.route) {
        body.route.locations.forEach((matched, stop) => {
            let leg = stop == 0 ? null : body.route.legs.find(l => l.index == stop - 1);
            routed.push(
                new RoutedAddress(
                    `${matched.street}, ${matched.adminArea5}, ${matched.adminArea3}`,
                    matched.postalCode,
                    stop,
                    leg?.distance ?? 0)
            );
        });
    }
    return Promise.resolve({
        data: routed,
        boundary: body?.route?.boundingBox
    });
};

export { validateAddress, routeAddressList };
