declare module "leaflet.heat" {
    import * as L from "leaflet";

    interface HeatLayerOptions {
        radius?: number;
        blur?: number;
        maxZoom?: number;
        max?: number;
        minOpacity?: number;
        gradient?: { [key: string]: string };
    }

    interface HeatLayer extends L.Layer {
        setLatLngs(latlngs: [number, number, number?][]): this;
        addLatLng(latlng: [number, number, number?]): this;
        setOptions(options: HeatLayerOptions): this;
    }

    namespace L {
        function heatLayer(latlngs: [number, number, number?][], options?: HeatLayerOptions): HeatLayer;
    }
}
