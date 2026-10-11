import {initializeAnalytics} from '@/src/lib/analytics';

if(typeof window!=='undefined'){
  try{
    if(window.localStorage.getItem('carrygo:privacy-consent:v1')==='granted') initializeAnalytics();
  }catch{}
}
