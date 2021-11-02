import { useEffect, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import {getLogger} from "../core";

interface MyLocation {
  position?: Position;
  error?: Error;
}
const log = getLogger('useMyLocation');

export const useMyLocation = () => {
  const [state, setState] = useState<MyLocation>({});
  useEffect(watchMyLocation, []);
  return state;

  function watchMyLocation() {
    let cancelled = false;
    Geolocation.getCurrentPosition({maximumAge:60000, timeout:500, enableHighAccuracy:true})
      .then(position => updateMyPosition('current', position))
      .catch(error => updateMyPosition('current',undefined, error));
    const callbackId = Geolocation.watchPosition({}, (position, error) => {
      updateMyPosition('watch', position? position: undefined, error);
    });
    return () => {
      cancelled = true;
      callbackId.then((id) => Geolocation.clearWatch({ id: id }))
    };

    function updateMyPosition(source: string, position?: Position, error: any = undefined) {
      log(source, position?.coords.latitude, position?.coords.longitude, error);
      if(!position)
        return
      if (!cancelled) {
        setState({ ...state, position: position || state.position, error });
      }
    }
  }
};
