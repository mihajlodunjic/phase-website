// Shared score events: synth and visual arrivals use these exact times.
export const ECHO_EVENTS = [
  {at:.2,frequency:660},{at:1.1,frequency:880},{at:2,frequency:784},{at:3.1,frequency:1046.5},
  {at:4.2,frequency:659.25},{at:5.4,frequency:987.77},{at:6.6,frequency:783.99},{at:7.7,frequency:1174.66},
] as const
export const FORM_EVENTS = [
  {at:.12,frequency:130.8128,duration:1.1,amplitude:.12,attack:.018},
  {at:.42,frequency:195.998,duration:.9,amplitude:.08,attack:.012},
  {at:.82,frequency:261.6256,duration:1.55,amplitude:.12,attack:.02},
  {at:4.55,frequency:261.6256,duration:1.4,amplitude:.09,attack:.02},
  {at:4.78,frequency:329.6276,duration:1.5,amplitude:.065,attack:.025},
  {at:5.12,frequency:391.9954,duration:2.25,amplitude:.075,attack:.03},
] as const
