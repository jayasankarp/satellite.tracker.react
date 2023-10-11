import 'react';
import {useMemo, useRef, useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import * as THREE from 'three';
import Globe from "react-globe.gl";
import {isDaytime} from "../utils.js";

const World = () => {
    const EARTH_RADIUS_KM = 6371;
    const SAT_SIZE = 150;

    const globeEl = useRef();

    const [globeRadius, setGlobeRadius] = useState();
    const [positioned, setPositioned] = useState(false);

    const { data } = useQuery(['pollData'], async () => {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        return response.json();
    }, {refetchInterval: 10000});

    const issData = useMemo(() => {
        if (!data) return [];
        const result = [{
            name: 'International Space Station (ISS)',
            lat: data.latitude,
            lng: data.longitude,
            alt: data.altitude / EARTH_RADIUS_KM }];
        return result;
    }, [data]);

    const issObject = useMemo(() => {
        if (!globeRadius) return undefined;

        const satGeometry = new THREE.CapsuleGeometry(SAT_SIZE * globeRadius / EARTH_RADIUS_KM / 2, 1);
        const satMaterial = new THREE.MeshLambertMaterial({ color: 'palegreen', transparent: true, opacity: 0.8 });
        return new THREE.Mesh(satGeometry, satMaterial);
    }, [globeRadius]);

    const setView = (data) => {
        const {lat, lng } = data;
        const result = {lat, lng, alt: 3.5 };
        globeEl.current.pointOfView(result, 500);
    }

    useEffect(() => {
        if(issData?.length <= 0 || positioned) return;

        setView(issData[0]);
        setPositioned(true);
    }, [issData, positioned]);

    useEffect(() => {
        setGlobeRadius(globeEl.current.getGlobeRadius());
    }, []);

    return <div className={'w-full'}>
            <Globe
                ref={globeEl}
                objectsData={issData}
                objectLabel="name"
                objectLat="lat"
                objectLng="lng"
                objectAltitude="alt"
                objectFacesSurface={false}
                globeImageUrl={`//unpkg.com/three-globe/example/img/${isDaytime() ? 'earth-blue-marble.jpg' : 'earth-night.jpg'}`}
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                objectThreeObject={issObject}
            />
        {issData && <div onClick={() => setView(issData?.[0])}
            className={'absolute left-2 bottom-2 text-white font-thin text-xs cursor-pointer'}>ISS (Update Interval. 10 Seconds): {issData?.[0]?.lat}, {issData?.[0]?.lng})</div>}
        </div>
}
export default World;