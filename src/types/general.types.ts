export interface GoogleCoordinates {
    error_message? : string,
    results: [{
      geometry: {
        location: {
          lat: number,
          lng: number
        }
      }
  }]
  }
export interface GoogleDistance {
    error_message? : string,
    rows: [{
      elements: [{
        distance: {
          text : string,
          value: number
        }
      }]
  }]
  }

export interface GDistance {
    text: string,
    value: number
  }

export interface PostgrePoint {
    x: number,
    y: number
  }
