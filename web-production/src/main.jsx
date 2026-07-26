import React,{useEffect,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{Room,RoomEvent}from'livekit-client';
import'./styles.css';

const LIVE_API='https://fairones-live-api-smashbakk.azurewebsites.net/api';
const GOOGLE_CLIENT_ID='435559857587-4e9e9vo01keti8l25m9cfdhcu8r55h83.apps.google