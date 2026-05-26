# Roots & Flame — Premium nettside

Offisiell premium-nettside for **Roots & Flame** restaurant i Narvik.

## Åpne nettsiden

**Enklest — dobbeltklikk:**
`index.html` i denne mappen (menyen fungerer uten server).

**Anbefalt — lokal server:**
```bash
cd ~/roots-and-flame-mockups
python3 -m http.server 8888
```
Åpne: **http://localhost:8888**

## Innhold

- Cinematisk hero med ekte bilder
- Verdier, tilbud (499,- / 349,-), galleri
- **Full meny** — 152 retter i 10 kategorier
- Om oss, bedrift, reservasjon
- Norsk / engelsk
- Mobilvennlig med ring/meny-knapper nederst

## Filer

| Fil | Beskrivelse |
|-----|-------------|
| `index.html` | Hovednettsiden |
| `shared/css/premium.css` | Premium design |
| `shared/js/menu-data.js` | Meny (fungerer offline) |
| `shared/data/menu.json` | Menykilde |
| `scripts/update-menu.py` | Oppdater meny fra rootsandflame.no |

## Oppdater meny

```bash
python3 scripts/update-menu.py
```

## Mockups

Gamle design-mockups ligger i `mockups/all-mockups.html`.
