/**
 * Wilawan Svenska - Lokal API-konfiguration
 * 
 * INSTRUKTION FÖR ATT LÄGGA TILL DIN NYCKEL UTAN ATT DEN SYNS PÅ GITHUB:
 * 1. Gör en kopia av denna fil i samma mapp och döp kopian till: config.local.js
 * 2. Klistra in din nya Groq API-nyckel (och ev. Azure-nyckel) nedan.
 * 
 * SÄKERHET:
 * Filen "config.local.js" är listad i .gitignore och kommer ALDRIG
 * att kunna checkas in eller laddas upp till GitHub!
 */

window.ENV_CONFIG = {
  // Din nya Groq API-nyckel (börjar med gsk_...)
  GROQ_API_KEY: '',

  // Valfritt: Microsoft Azure Speech SDK Key & Region
  AZURE_SPEECH_KEY: '',
  AZURE_SPEECH_REGION: 'swedencentral'
};
