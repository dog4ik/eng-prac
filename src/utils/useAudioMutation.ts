import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const useAudioMutation = (volume: number) => {
  const audioMutation = useMutation(async (word: { text?: string }) => {
    return await axios
      .post<ArrayBuffer>("/api/translate/tts", word, {
        responseType: "arraybuffer",
      })
      .then(async (data) => {
        const byteArray = data.data;
        if (byteArray.byteLength == 0) return;
        const context = new AudioContext();
        const audioBuffer = await context.decodeAudioData(byteArray);
        const source = context.createBufferSource();
        const gainNode = context.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(context.destination);
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.start();
      });
  });

  return audioMutation;
};

export default useAudioMutation;
