import { Component, CSSProperties } from 'react';

declare module 'react-yandex-maps' {
  interface YMapsProps {
    query: {
      apikey: string;
      lang?: string;
    };
    onLoad?: (ymaps: any, Map: any) => void;
    children?: React.ReactNode;
  }

  interface MapProps {
    width?: string | number;
    height?: string | number;
    state: {
      center: [number, number];
      zoom: number;
      controls?: string[];
    };
    modules?: string[];
    onClick?: (ymaps: any, map: any, event: any) => void;
    onLoad?: (ymaps: any, map: any) => void;
    children?: React.ReactNode;
  }

  interface PlacemarkProps {
    geometry: [number, number] | { type: 'Point'; coordinates: [number, number] };
    properties?: {
      balloonContentHeader?: string;
      balloonContentBody?: string;
      hintContent?: string;
      iconContent?: string;
    };
    options?: {
      preset?: string;
      iconColor?: string;
    };
    onClick?: (ymaps: any, placemark: any, event: any) => void;
  }

  interface SearchControlProps {
    options?: {
      provider?: string;
      width?: string | number;
      placeholder?: string;
    };
  }

  export const YMaps: Component<YMapsProps>;
  export const Map: Component<MapProps>;
  export const Placemark: Component<PlacemarkProps>;
  export const SearchControl: Component<SearchControlProps>;
}
