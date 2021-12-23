export function _getLocaleHours(time){
  if(!time) return;
  let dateLocale = new Date(time * 1000).toLocaleString();
  let dateSplit = dateLocale.split(',');
  let timeSplit = dateSplit[1].split(':');
  let hours = Number(timeSplit[0].substring(1));
  let minutes = Number(timeSplit[1]);
  let meridium = timeSplit[2].split(" ")[1];

  if(meridium === "PM" && hours !== 12) hours = hours + 12;
  if(hours < 10) hours = `0${hours}`;
  if(minutes < 10) minutes = `0${minutes}`;
  let localeTime = `${hours}:${minutes}`
  return localeTime;
}

export function _getLocaleDate(time){
  if(!time) return;
  let dateLocale = new Date(time * 1000).toLocaleString();
  let dateSplit = dateLocale.split(',');
  return dateSplit[0];
}

export function _getAgoTime(time) {
  const time_now = Math.floor(new Date().getTime() / 1000);

  if (time > time_now - 60) return "Just Now";
  if (time > time_now - 3600) {
    let minutes = Math.floor((time_now - time) / 60);
    if(minutes > 1) return `${minutes} Minutes Ago`;
    return `${minutes} Minute Ago`;
  } else if (time > time_now - 86400) {
    let hours = Math.floor((time_now - time) / 3600);
    if(hours > 1) return `${hours} Hours Ago`;
    return `${hours} Hour Ago`;
  } else if (time > time_now - 2592000) {
    let days = Math.floor((time_now - time) / 86400);
    if(days > 1) return `${days} Days Ago`;
    return `${days} Day Ago`;
  } else {
    let dateLocale = new Date(time * 1000).toLocaleString();
    let dateSplit = dateLocale.split(',');
    return dateSplit[0];
  }
}