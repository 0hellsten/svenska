# Längre spel och en gemensam progression

Gränssnitt, berättelser, instruktioner och återkoppling är på thai. Svenska används för det som tränas. Thai är huvudspråk med några lättbegripliga sydthailändska uttryck; detta är ingen fullständig dialektöversättning.

## Kursplan: 58 uppgifter

- Kök: åtta recept med tre steg vardera (24 uppgifter). Läsning med översättning, återkallning utan synlig översättning, sedan lyssning med bilder. Recepten delar ord så att tidigare kunskap används i nya sammanhang. Receptillustrationer är ursprunglig SVG. Recepten är språkövningar, utan köksmått.
- Café: sex pass med 5, 6, 6, 7, 7 och 8 kunder (39 beställningar). En till tre varor, antal upp till fyra, flera sätt att beställa och slutligen hörförståelse.
- Ordalbum: åtta temapaket, tre steg per paket (24 uppgifter). Sex bild–ordpar blir hörövningar. Upp till två extra ord hämtas endast från ett annat paket som eleven redan genomfört. Utan tidigare paket behålls sex par.
- Zoo: fyra nätter med tre kapitel per natt. Samma illustrerade miljö återbesöks med nytt språkfokus: namn, lägesord, meningar och lyssning. Totalt 48 djurfrågor och tolv lås. Det pågående äventyret sparas; nya nätter öppnas i ordning.

Hjälp, långsamt ljud och översättning är alltid tillåtna. Inga poäng dras av för hjälp i småspelen. Nästa steg öppnas när föregående uppgift är klar; den som behöver hjälp kan fortsätta öva.

## Belöningar

Reglerna i `learning_progress.js` delas med huvudappens StateManager.

- Första genomförandet: 8/10/12 XP för kök och ordalbum, 12–22 XP för café, 24–36 XP för zoo.
- Upprepad uppgift samma dag: 0 XP. Repetition en senare dag: 2 XP, högst tre olika uppgifter per dag.
- Högst 60 XP från småspelen per lokal kalenderdag. Hela appen har ett tak på 180 XP och 20 intjänade juveler per dag. Befintliga saldon behålls.
- Var tredje ny uppgift ger två juveler en gång. Obetalda milstolpsjuveler kan hämtas vid ett senare genomförande när dagsgränsen tillåter det.
- Om en förstagångsbelöning delvis ryms under XP-taket sparas resten. Den kan betalas ut först efter ett nytt genomförande en senare dag. Samma avslutningshändelse kan inte betala två gånger.
- Spelens uppgiftsbelöningar multipliceras inte av en XP-booster. Kombo i sprint är ett lokalt jämförelseresultat; den dubblerar inte XP för redan belönade svar.
- Lektionssvar ger normalt 4–6 XP. Lektions- och sprintavslut ger högst två juveler. Första avslutade uttalsutmaningen respektive kategoribossen ger högst fem. Slumpboxen innehåller övningshjälp, aldrig stora XP- eller juvelvinster.

## Ranker

Gränserna är 0, 120, 360, 800, 1 500, 2 600 och 4 200 XP. Utöver XP krävs 2/6/12/20/30/40 olika uppgifter **eller** 10/35/80/150/250/400 faktiskt övade ord. Rankerna kräver även 1/2/4/7/14/28 aktiva träningsdagar. Tomma SRS-poster som skapats vid visning av ordbanken räknas inte.

Rankerna beskriver träningsvana och varierad aktivitet. De gör inga påståenden om CEFR, perfekt uttal eller flytande svenska. Gamla spelresultat importeras som genomförda första uppgifter utan att betala nya förstagångspoäng.

All progression sparas lokalt i webbläsaren. Samma ursprung delar uppgifter och poäng mellan spelen; andra enheter och rensad webbläsarlagring har egna framsteg.

## Kontroll

`node --test test_learning_progress.cjs test_mini_games.cjs test_zoo.cjs`

Bygg de fristående HTML-filerna med `bundle.py`. Browserkontrollen omfattar mobilstorlekar, kompletta spelomgångar, fortsatt progression och den äldre appens `test_suite.html`.
