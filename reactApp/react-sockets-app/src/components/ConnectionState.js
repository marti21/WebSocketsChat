import React from 'react';

export function ConnectionState({ isConnected }) {
  if(isConnected){
    return <strong>Connected</strong>;
  }
  else {
    return <strong>Connection error</strong>
  }
}