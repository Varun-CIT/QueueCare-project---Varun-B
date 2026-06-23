export function announcePatient(
  token: string | number,
  eta: number
) {
  if (typeof window === "undefined") return;

  if (!("speechSynthesis" in window)) {
    console.log("Speech synthesis not supported");
    return;
  }

  window.speechSynthesis.cancel();

  const english = new SpeechSynthesisUtterance(
    `Attention please. Token number ${token}. Please proceed to consultation room. Estimated waiting time for the next patient is ${eta} minutes. Thank you.`
  );

  english.lang = "en-US";
  english.rate = 0.9;
  english.pitch = 1;
  english.volume = 1;

  const hindi = new SpeechSynthesisUtterance(
    `कृपया ध्यान दें। टोकन नंबर ${token}। कृपया परामर्श कक्ष में आएं। अगले मरीज के लिए अनुमानित प्रतीक्षा समय ${eta} मिनट है। धन्यवाद।`
  );

  hindi.lang = "hi-IN";
  hindi.rate = 0.9;
  hindi.pitch = 1;
  hindi.volume = 1;

  english.onend = () => {
    window.speechSynthesis.speak(hindi);
  };

  window.speechSynthesis.speak(english);
}