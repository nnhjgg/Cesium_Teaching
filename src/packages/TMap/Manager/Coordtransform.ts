class Coordtransform {
    static x_PI = 3.14159265358979324 * 3000.0 / 180.0

    static PI = 3.1415926535897932384626

    static a = 6378245.0

    static ee = 0.00669342162296594323

    static OutOfChina(lngI: number, latI: number) {
        let lat = +latI
        let lng = +lngI
        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
    }

    static Transformlat(lngI: number, latI: number) {
        let lat = +latI
        let lng = +lngI
        let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
        ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0
        ret += (20.0 * Math.sin(lat * this.PI) + 40.0 * Math.sin(lat / 3.0 * this.PI)) * 2.0 / 3.0
        ret += (160.0 * Math.sin(lat / 12.0 * this.PI) + 320 * Math.sin(lat * this.PI / 30.0)) * 2.0 / 3.0
        return ret
    }

    static Transformlng(lngI: number, latI: number) {
        let lat = +latI
        let lng = +lngI
        let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
        ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0
        ret += (20.0 * Math.sin(lng * this.PI) + 40.0 * Math.sin(lng / 3.0 * this.PI)) * 2.0 / 3.0
        ret += (150.0 * Math.sin(lng / 12.0 * this.PI) + 300.0 * Math.sin(lng / 30.0 * this.PI)) * 2.0 / 3.0
        return ret
    }

    static Wgs84ToGcj02(lngI: number, latI: number) {
        let lat = +latI
        let lng = +lngI
        if (this.OutOfChina(lng, lat)) {
            return [lng, lat]
        } else {
            let dlat = this.Transformlat(lng - 105.0, lat - 35.0)
            let dlng = this.Transformlng(lng - 105.0, lat - 35.0)
            let radlat = lat / 180.0 * this.PI
            let magic = Math.sin(radlat)
            magic = 1 - this.ee * magic * magic
            let sqrtmagic = Math.sqrt(magic)
            dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * this.PI)
            dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * this.PI)
            let mglat = lat + dlat
            let mglng = lng + dlng
            return [mglng, mglat]
        }
    }

    static Gcj02ToWgs84(lngI: number, latI: number) {
        var lat = +latI
        var lng = +lngI
        if (this.OutOfChina(lng, lat)) {
            return [lng, lat]
        } else {
            var dlat = this.Transformlat(lng - 105.0, lat - 35.0)
            var dlng = this.Transformlng(lng - 105.0, lat - 35.0)
            var radlat = lat / 180.0 * this.PI
            var magic = Math.sin(radlat)
            magic = 1 - this.ee * magic * magic
            var sqrtmagic = Math.sqrt(magic)
            dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * this.PI)
            dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * this.PI)
            var mglat = lat + dlat
            var mglng = lng + dlng
            return [lng * 2 - mglng, lat * 2 - mglat]
        }
    }

    /**
     * @author Together
     * @param oLng 原始经度
     * @param oLat 原始纬度
     * @param angle 偏移角度
     * @param distance 偏移距离
     * @description 偏移经纬度
     * @return 
     */
    static Offset(oLng: number, oLat: number, angle: number, distance: number) {
        let lonlat: Array<number> = [];
        lonlat[0] = oLng + distance * Math.sin(angle * Math.PI / 180) * 180 / (Math.PI * 6371229 * Math.cos(oLat * Math.PI / 180))
        lonlat[1] = oLat + distance * Math.cos(angle * Math.PI / 180) / (Math.PI * 6371229 / 180)
        return lonlat
    }

    static Wgs84toBd09(lng: number, lat: number) {
        const gcj02 = this.Wgs84ToGcj02(lng, lat)
        return this.Gcj02ToBd09(gcj02[0], gcj02[1])
    }

    static Gcj02ToBd09(lng: number, lat: number) {
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.x_PI)
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.x_PI)
        var bd_lng = z * Math.cos(theta) + 0.0065
        var bd_lat = z * Math.sin(theta) + 0.006
        return [bd_lng, bd_lat]
    }

    static Bd09ToGcj02(lng: number, lat: number) {
        var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
        var x = lng - 0.0065;
        var y = lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat]
    }

    static Bd09ToWgs84(lng: number, lat: number) {
        const t = this.Bd09ToGcj02(lng, lat)
        return this.Gcj02ToWgs84(t[0], t[1])
    }
}

export { Coordtransform }