import { useState, useEffect } from 'react';
import { RoutedAddress, Location, BoundingBox } from '../classes';
import { validateAddress, routeAddressList } from '../actions/mapActions';
import { ErrorToast } from './toastMessage';
import { Button, Spinner, ToastContainer } from 'react-bootstrap';
import { CopyButton } from './copyButton';
import { CopyContent } from '../actions/clipboardActions';

export const AddressList = () => {
    const [list, setList] = useState([]);
    const [routedList, setRoutedList] = useState([]);
    const [boundary, setBoundary] = useState({});
    const [errorData, setErrorData] = useState([]);
    const [routeWait, setRouteWait] = useState(false);
    const [validateWait, setValidateWaiting] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [mapCenter, setMapCenter] = useState([33.1713531, -96.8214918]);

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
        }
    }

    const validateAddressList = async () => {
        setValidateWaiting(!validateWait);
        setErrorData([]);
        let errorData = [];
        var items = list.filter(a => a.Found === false);
        if (items && items.length > 0) {
            var results = items.map(async (location) => {
                if (location.Address) {
                    let l = await validateAddress(location.Address);
                    location.Match = l?.Match;
                    location.Found = l?.Found ?? false;
                    location.Error = l?.Error;
                    if (location.Error) {
                        errorData.push({ header: "Error validating", message: location.Message ?? location.Address, err: location.Error });
                    }
                    setErrorData(errorData.map(item => item));
                    setList(list.map(item => item));
                }
            });
            await Promise.all(results);
        }
        setValidateWaiting(false);
    };

    const copyRouted = async () => {
        let copyTextArray = routedList.map(i => `${i.Address}\t${i.Zip}`);
        if (copyTextArray?.length > 0) {
            let copyText = copyTextArray.join("\n");
            await CopyContent(copyText);
            alert(`${copyTextArray.length} addresses copied.`);
        }
    };

    useEffect(() => {
        //console.log("Validating", validateWait);
    }
        , [validateWait])
    useEffect(() => {
        //console.log("Routing", routeWait);
    }
        , [routeWait])

    useEffect(() => {
        console.log(boundary)
        if (!boundary) {
            setShowMap(false);
            return;
        }
        let xCenter = (boundary?.ul?.lng + boundary?.lr?.lng) / 2;
        let yCenter = (boundary?.ul?.lat + boundary?.lr?.lat) / 2;
        if (Number.isNaN(xCenter)) {
            setShowMap(false);
            return;
        }
        console.log("Center:", `${xCenter}, ${yCenter}`);
        setMapCenter([yCenter, xCenter]);
        setShowMap(true);
        let routedLocations = routedList.map(l => `${l.Address}, ${l.Zip}`);
        let directions = L.mapquest.directions();
        directions.route({
            locations: routedLocations
        });
    }, [boundary])

    const routeAddresses = async () => {
        setRouteWait(!routeWait);
        setRoutedList([]);
        setErrorData([]);
        let routed = await routeAddressList(list);
        if (routed?.error) {
            setErrorData([routed.error]);
        }
        setRoutedList(routed?.data);
        setBoundary(routed?.boundary);
        setRouteWait(false);
    }

    const formatTable = () => {
        return list.map((item, index) => {
            //console.log(index, item);
            return (
                <tr key={index} className={item.CssClass}>
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
                    <td>{item.Stop + 1}</td>
                    <td>{item.Address}</td>
                    <td>{item.Zip}</td>
                    <td>{`${item.Distance}`}</td>
                </tr>
            )
        });
    };
    const showErrors = () => {
        return errorData.map((item, index) => {
            return (
                <ErrorToast key={index}
                    header={item.header}
                    message={item.message}
                    err={item.err}
                />
            )
        });
    };

    return (
        <div className="container">
            <ToastContainer containerPosition="position-fixed" position='top-center'>
                {errorData && showErrors()}
            </ToastContainer>
            <div className="row">
                <div className="col-sm">
                    <h2>Address input list</h2>
                    <textarea rows="20" cols="50" id="addressList" onChange={handleChange} />
                </div>
                <div className="col-sm">
                    <table className="table">
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
            <div className="row">
                <div className="col-sm">
                    {validateWait === true &&
                        (<Button disabled>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true" />
                        </Button>
                        )}
                    {validateWait === false && (
                        <Button id="validateBtn" onClick={validateAddressList}>Validate
                        </Button>
                    )}
                </div>
                <div className="col-sm">
                    {routeWait === true &&
                        (<Button disabled>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true" />
                        </Button>
                        )}
                    {routeWait === false && (
                        <Button id="routeBtn" onClick={routeAddresses}>Route
                        </Button>
                    )}
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Stop</th>
                                <th>Address
                                    <CopyButton height="14" width="14" copyClickHandler={copyRouted} />
                                </th>
                                <th>Zip</th>
                                <th>Distance</th>
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

