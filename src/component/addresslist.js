import { useState, useEffect } from 'react';

export const AddressList = () => {
    const [list, setList] = useState([]);
    const [routedList, setRoutedList] = useState([]);
    const handleChange = (event) => {
        var val = event?.target?.value;
        if (val) {
            var textList = val.split("\n");
            let newList = [];
            textList.forEach((item, index) => {
                var address = list.find(a => a.Address?.toLowerCase() == item.toLowerCase());
                if (!address) {
                    address = new Location();
                    address.Address = item;
                }
                if (address) {
                    newList.push(address);
                }
            });
            setList(newList);
            console.log(list);
        }
    }
    const validateAddressList = () => {
        var items = list.filter(a => a.Found === false);
        if (items && items.length > 0) {
            items.forEach(async (location) => {
                await validateAddress(location);
            });
        }
    };
    const routeAddressList = async () => {
        var items = list.filter(a => a.Found === true);
        if (items && items.length > 0) {
            //https://here-b2c.aws.mapquest.com/directions/v2/optimizedroute?timeType=1
            let request = {
                locations: items.map(i => i.Match),
                options: {
                    narrativeType: "none"
                }
            };
            const response = await fetch("https://here-b2c.aws.mapquest.com/directions/v2/optimizedroute?timeType=1", {
                method: "POST",
                cache: "no-cache",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });
            const body = await response.json();
            let routed = []
            if (body?.route) {
                body.route.locations.forEach((matched, stop) => {
                    let leg = stop == 0 ? null : body.route.legs.find(l => l.index == stop - 1);
                    routed.push(
                        new RoutedAddress(
                            `${matched.street}, ${matched.adminArea5}, ${matched.adminArea3}, ${matched.postalCode}`,
                            stop,
                            leg?.distance ?? 0)
                    );
                });
            }
            setRoutedList(routed);
        }
    };

    const validateAddress = (location) => {
        if (location && location?.Address?.trim()?.length > 0) {
            return fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=HbeZkfxVyOubAiNNEVA2yZSb79i96XyW&location=${location.Address}&boundingBox=34.023071,-97.893677,32.238359,-95.861206`)
                .then(response => {
                    console.log(response);
                    return response.json().then(body => {
                        if (body && body.results && body.results.length > 0) {
                            if (body.results[0].locations?.length > 0) {
                                let matched = body.results[0].locations[0];
                                if (matched.street?.length > 2) {
                                    if (BoundingBox.ValidateCoordinates(matched.latLng?.lat, matched.latLng?.lng)) {
                                        location.Found = true;
                                        location.Match = `${matched.street}, ${matched.adminArea5}, ${matched.adminArea3}, ${matched.postalCode}`;
                                    }
                                }
                            }
                        }
                        setList(list.map(i => i));
                        return location;
                    });
                });
        }
        return Promise.resolve();
    };
    useEffect(() => {

    },
        [list]);

    const formatTable = () => {
        return list.map((item, index) => {
            console.log(index, item);
            return (
                <tr key={index} class={item.CssClass}>
                    <td>{item.Address}</td>
                    <td>{`${item.Match}`}</td>
                </tr>
            )
        });
    };
    const formatRouted = () => {
        return routedList.map((item, index) => {
            return (
                <tr key={index}>
                    <td>{item.Stop}</td>
                    <td>{`${item.Address}`}</td>
                    <td>{`${item.Distance}`}</td>
                </tr>
            )
        });
    };

    return (
        <div class="container">
            <div class="row">
                <div class="col-sm">
                    <textarea rows="20" cols="50" id="addressList" onChange={handleChange} />
                </div>
                <div class="col-sm">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Address</th><th>Match</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formatTable()}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="row">
                <div class="col-sm">
                    <button id="validateBtn" onClick={validateAddressList}>Validate</button>
                </div>
                <div class="col-sm">
                    <button id="routeBtn" onClick={routeAddressList}>Route</button>
                </div>
            </div>
            <div class="row">
                <div class="col-sm">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Stop</th><th>Address</th><th>Distance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routedList && formatRouted()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

class Location {
    constructor() {
        this.address = "";
        this.match = "";
        this.found = false;
    }
    get Address() { return this.address; }
    set Address(value) { this.address = value; }

    get Match() { return this.match; }
    set Match(value) { this.match = value; }

    get Found() { return this.found; }
    set Found(value) { this.found = value; }

    get CssClass() { return this.found ? "found" : "notfound"; }
}
class RoutedAddress {
    constructor(address, stop, distance) {
        this.address = address;
        this.distance = distance;
        this.stop = stop;
    }
    get Address() { return this.address; }
    set Address(value) { this.address = value; }

    get Distance() { return this.distance; }
    set Distance(value) { this.distance = value; }

    get Stop() { return this.stop; }
    set Stop(value) { this.stop = value; }
}

class BoundingBox {
    static MinLongitude = -97.893677;
    static MaxLongitude = -95.861206;
    static MinLatitude = 32.238359;
    static MaxLatitude = 34.023071;
    static ValidateCoordinates = (lat, long) => {
        if (lat > this.MaxLatitude || lat < this.MinLatitude) return false;
        if (long > this.MaxLongitude || long < this.MinLongitude) return false;
        return true;
    };

}