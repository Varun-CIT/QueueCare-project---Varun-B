export const announcePatient = (token, eta) => {

    if(!window.speechSynthesis){

        return;

    }

    const speech = new SpeechSynthesisUtterance(

        `Token ${token},
        please proceed to consultation room.
        Estimated waiting time for the next patient is ${eta} minutes.`

    );

    speech.rate = 0.95;

    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

};