# Beyond a room

A portal to unexpected corners of the internet, reached by a QR code in a university room.
By Antoine Clauzel, Daniel Sanz Jakob and Esther Roussel.

Plain HTML, CSS and JavaScript. No build step, no frameworks, no tracking, no analytics, no paid services.
Works on GitHub Pages (free).

## What is in the folder

```
beyond-a-room/
├── index.html            landing page (intro, "Explore a random web", "Add your own links")
├── add.html              second page (warning + link form)
├── links.txt             THE LIST OF APPROVED LINKS (edit this to add or remove sites)
├── css/style.css         all styling
├── js/
│   ├── config.js         the Google Form address (you fill this in, section 3)
│   ├── i18n.js           all texts in English, French and Spanish
│   ├── common.js         language, background video, shared code
│   ├── index.js          intro, sound, random link
│   └── add.js            link validation and sending
├── assets/
│   ├── background-720.mp4   silent looping video (desktop, 2.4 MB)
│   ├── background-480.mp4   lighter version for phones (1.3 MB)
│   ├── intro.m4a            the sound of your video, played once
│   └── poster.jpg           still frame shown while the video loads
├── start-local.command   double-click to preview on Mac
├── start-local.bat       double-click to preview on Windows
└── .nojekyll             tells GitHub Pages to publish the files as they are
```

## How the experience works

1. First visit: a short screen offers **Enter with sound** or **Enter without sound** (browsers only allow sound after a tap).
2. With sound, the 30-second intro plays once. Tap or click anywhere (or press Esc) to skip it. A small **Mute** button is available.
3. The interface then fades in over the still-looping video, followed by a short concept overlay.
4. After that, the visitor's browser remembers the intro was seen (one small flag in local storage, no cookies, no personal data), so returning visitors go straight to the two panels, with no sound.
5. The video loops silently from then on. The sound plays only once.

To see the intro again while testing: open the browser's developer tools, then clear the site's local storage, or use a private window.

## 1. Run it on your computer

Opening `index.html` by double-clicking will **not** work properly. Browsers refuse to let a page that was opened from a file read `links.txt`. This is a browser safety rule, not a bug. The fix is simply to let a tiny local web server hand out the files.

- **Mac:** double-click `start-local.command`. (First time only: right-click, Open, then confirm.)
- **Windows:** double-click `start-local.bat`.
- Both need Python installed (free from python.org; Macs usually have it). The site opens at http://localhost:8000.

Once the site is published (section 4) you do not need any of this: it just works.

## 2. Edit the list of links

Open `links.txt`. One link per line, each starting with `https://`. Lines starting with `#` are ignored. Save, upload, done; no code changes needed.

The button picks randomly without repeating any link until all of them have been used, and never repeats the same link twice in a row.

### What was changed from your original PDF
Every change is listed here so you can check it.

**Fixed (glued or broken addresses)**
- `miniclip.comhttps://www.kongregate.com`, `vam.ac.ukhttps://www.getty.edu`, `typographicposters.comhttps://www.fontsinuse.com`, `asteroid-launcherhttps://www.neal.fun/ambient-chaos` were split into separate links.
- `eel slap.com` became `eelslap.com`.
- `neal.fun/ internet-artifacts` became `neal.fun/internet-artifacts`.
- `www.neal.fun/...` became `neal.fun/...` (the official address).
- `www.98.js.org` became `98.js.org` (there is no www version).
- `www.chrome-music-lab.com` became `musiclab.chromeexperiments.com` (the real Chrome Music Lab address; the original looked like a guess).
- `google.com/culturalinstitute` became `artsandculture.google.com` (its current address).

**Duplicates removed:** 10 repeated entries (boredbutton, pentagram, Wikipedia Random, itsnicethat, are.na, geoguessr, the Rickroll and others). The Rickroll is kept once, exactly as you wrote it.

**Removed to improve the experience** (all still in `links.txt`, commented out at the bottom; delete the `#` to bring one back)
- miniclip, kongregate, poki, crazygames, coolmathgames: ad-heavy game portals.
- minecraft.net: a product page. figma.com: sign-up wall.
- infinitecraft.com: unverified (the original, neal.fun/infinite-craft, stays).
- odd-sites.com, design.studio: I could not verify that these exist.

**Result:** 91 links. I could not test every site live from my environment, so open each one once yourself before the installation. Websites change or disappear over time.

**Photosensitivity note:** `staggeringbeauty.com` is known to use rapid flashing effects. The Beyond a room website itself has no flashing, but you may prefer to comment that line out.

## 3. Receive submissions privately (Google Form, free)

A website hosted on GitHub Pages cannot store anything. Submitted links go to a **private Google Form**. Nobody can see them except the form's owner(s), so nothing appears publicly until you copy it into `links.txt`.

1. Go to https://forms.google.com and create a new form named "Beyond a room links".
2. Add **one** question: type *Short answer*, title "Link". Mark it required. (Optional: three dots, Response validation, URL.)
3. Settings: turn **off** "Collect email addresses", turn **off** "Limit to 1 response", and do not restrict to your organisation (otherwise visitors would be asked to sign in).
4. Open the **Responses** tab and click the green Sheets icon to link a Google Sheet. This is where you review submissions.
5. Get the two values the website needs:
   - Click the three dots at the top right, then **Get pre-filled link**. Type `test` in the question and click **Get link**. Copy the link and paste it somewhere. It looks like
     `https://docs.google.com/forms/d/e/1FAIpQLSc...XYZ/viewform?usp=pp_url&entry.1234567890=test`
   - The part between `/d/e/` and `/viewform` is your **form id**. The code `entry.1234567890` is your **field name**.
6. Open `js/config.js` and fill in:
   ```js
   formAction: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
   fieldName: "entry.1234567890"
   ```
   Replace `YOUR_FORM_ID` with the form id (keep `/formResponse` at the end).
7. Test: submit a link on the add page. It should appear as a new row in the Sheet within a few seconds.

Note: Google does not let a website read back the form's reply, so the page shows "success" once the request has been sent. That is why step 7 matters.

**Reviewing:** open the Sheet, check each link in your browser, and paste approved ones into `links.txt`. Delete or ignore the rest. In a Sheet you can also share the link with a team mate for shared moderation.

**Privacy:** only the typed link is sent. Google, as the form provider, can see technical data such as the IP address on its side. The site adds a hidden spam trap, a 10-second wait between submissions, and accepts only http(s) addresses.

## 4. Publish on GitHub Pages (free)

You will need a free GitHub account.

1. Go to https://github.com and click **Sign up**. Choose a username (it will appear in your site's address) and confirm your email.
2. Click the **+** at the top right, then **New repository**. Name it `beyond-a-room`. Keep it **Public** (required for free Pages). Do not add a README. Click **Create repository**.
3. On the next page click **uploading an existing file**.
4. Unzip `beyond-a-room.zip`. Open the folder, select **everything inside it** (including the `css`, `js` and `assets` folders and the hidden `.nojekyll` file) and drag it into the GitHub page. Wait for the upload to finish.
   - Make sure `index.html` is at the top level of the repository, not inside an extra folder.
5. Click **Commit changes**.
6. Go to **Settings**, then **Pages** (left menu). Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
7. Wait one or two minutes and refresh. GitHub shows your address: `https://YOUR-USERNAME.github.io/beyond-a-room/`

### Making the QR code
Use any QR generator that does not track scans (for example the free *QR Code Generator* options without "dynamic" codes, or `qrencode` on the command line) with the address above, and print it. Test it with a phone on mobile data, not only on Wi-Fi.

### Updating later
- **Add an approved link:** on GitHub, open `links.txt`, click the pencil icon, add the line, then **Commit changes**. The site updates in about a minute.
- **Change any text:** edit `js/i18n.js` the same way.

### Optional: your own domain
In Settings, Pages, Custom domain. Buying a domain is not free, so this is optional.

## Accessibility and respect for visitors
- No flashing effects. Keyboard and screen reader friendly; visible focus outlines; messages are announced.
- If the visitor's device asks for reduced motion, the background video stays on its still frame and transitions are instant.
- The sound is never forced: it needs a tap, can be muted or skipped, and plays only once.
- Fonts are system fonts (Helvetica for headlines, Baskerville-style serif for text), like the art-direction book. Nothing is loaded from Google Fonts or any third party. If a device lacks Baskerville, it falls back to Georgia.
- Every destination opens in a new tab with `rel="noopener noreferrer"`, so destinations do not receive the site's address.

## Replacing the video later
Keep the file names in `assets/`, or update them in `js/common.js` and `js/index.js`. To re-compress with ffmpeg:

```
ffmpeg -i NEW.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 29 -pix_fmt yuv420p -movflags +faststart assets/background-720.mp4
ffmpeg -i NEW.mp4 -an -vf scale=854:-2  -c:v libx264 -crf 30 -pix_fmt yuv420p -movflags +faststart assets/background-480.mp4
ffmpeg -i NEW.mp4 -vn -c:a aac -b:a 96k assets/intro.m4a
```
