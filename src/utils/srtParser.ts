const timeMs = function (val: string) {
  const regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
  const parts = regex.exec(val);

  if (parts === null) {
    return 0;
  }
  const timeParts = [];
  for (let i = 1; i < 5; i++) {
    timeParts.push(parseInt(parts[i], 10));
    if (isNaN(timeParts[i])) timeParts[i] = 0;
  }

  // hours + minutes + seconds + ms
  return (
    timeParts[1] * 3600000 +
    timeParts[2] * 60000 +
    timeParts[3] * 1000 +
    timeParts[4]
  );
};
const parse = (data: string, useMs: boolean) => {
  data = data.replace(/\r/g, "");
  const regex =
    /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
  const ArrData = data.split(regex);

  ArrData.shift();

  const items = [];
  for (let i = 0; i < ArrData.length; i += 4) {
    items.push({
      id: Number(ArrData[i].trim()),
      startTime: useMs ? timeMs(ArrData[i + 1].trim()) : ArrData[i + 1].trim(),
      endTime: useMs ? timeMs(ArrData[i + 2].trim()) : ArrData[i + 2].trim(),
      text: ArrData[i + 3].trim(),
    });
  }

  return items;
};
const srtParser = (srt: string) => {
  return parse(srt, true);
};
export default srtParser;
