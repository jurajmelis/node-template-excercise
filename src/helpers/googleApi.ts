import axios from "axios";
import { GoogleCoordinates, GDistance, GoogleDistance } from "types/general.types";

export const getCoordinates = async (apiKey: string, address: string): Promise<string> => {
  const config = {
    method: "get",
    url: "https://maps.googleapis.com/maps/api/geocode/json",
    params: {
      address: address,
      key: apiKey,
    },
  };
  try {
    const { data } = await axios<GoogleCoordinates>(config);
    const lat: number = data.results[0].geometry.location.lat;
    const lng: number = data.results[0].geometry.location.lng;
    return `${lat}, ${lng}`;
  } catch (error) {
    console.log(error);
    return `0, 0`;
  }
};

export const getDistance = async (apiKey: string, srcAddress: string, dstAddress: string): Promise<GDistance> => {
  const config = {
    method: "get",
    url: "https://maps.googleapis.com/maps/api/distancematrix/json",
    params: {
      destinations: dstAddress,
      origins: srcAddress,
      units : "metric",
      key: apiKey,
    },
  };
  try {
    const { data } = await axios<GoogleDistance>(config);
    const distance: GDistance = data.rows[0].elements[0].distance;
    return distance;
  } catch (error) {
    console.log(error);
    return {text: "", value: 0};
  }
};
