export class Location {
    constructor() {
        this.address = "";
        this.match = "";
        this.found = false;
        this.error = null;
    }
    get Address() { return this.address; }
    set Address(value) { this.address = value; }

    get Match() { return this.match; }
    set Match(value) { this.match = value; }

    get Found() { return this.found; }
    set Found(value) { this.found = value; }

    get CssClass() { return this.found ? this.ExactMatch ? "found" : "partialFound" : "notfound"; }

    get MatchType() {
        return this.found ? this.ExactMatch ? "Exact" : "Partial" : "Not found"; 
    }

    get Error() { return this.error; }
    set Error(value) { this.error = value;}

    get ExactMatch() { 
        let addressPartial = this.address?.toLowerCase().substring(0, this.address.length > 5 ? 5 : this.address.length);
        let matchPartial = this.match?.toLowerCase().substring(0, this.match.length > 5 ? 5 : this.match.length);
        return (matchPartial == addressPartial);
    }

    static withError(err) {
        let o = new Location();
        o.error = err;
        return o;
    }
}

export class RoutedAddress {
    constructor(address, zip, stop, distance) {
        this.address = address;
        this.zip = zip;
        this.distance = distance;
        this.stop = stop;
        this.error = null;
    }
    get Address() { return this.address; }
    set Address(value) { this.address = value; }

    get Zip() { return this.zip; }
    set Zip(value) { this.zip = value; }

    get Distance() { return this.distance; }
    set Distance(value) { this.distance = value; }

    get Stop() { return this.stop; }
    set Stop(value) { this.stop = value; }

    get Error() { return this.error; }

    static withError(err) {
        let o = new Location();
        o.error = err;
        return o;
    }
}

export class BoundingBox {
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