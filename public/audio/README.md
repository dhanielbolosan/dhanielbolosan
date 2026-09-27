These eight effects are byte-identical to Cyanoxide's FF7-inspired portfolio:
https://github.com/Cyanoxide/ff7-menu-port/tree/main/frontend/public/audio

Mapping: select = menu movement/confirmation/cancel; error = invalid action;
slash/crit = portrait hits; heal = the portfolio's full-HP Limit recovery.
delete = portrait KO; limit = gauge reaching full charge;
fanfare = confirmation after the contact endpoint accepts a message.
The gauge uses Aerith's level-one growth rate. Full healing, self-revival, and
keeping Limit charge at KO are portfolio adaptations; the gauge empties only on use.
The piercing back.mp3 is intentionally omitted. Volume alone controls playback;
zero mutes, the default is 20%, and settings persist across visits.

`unused/` retains materia, save, saveSelect, and swish for later auditioning.
Playback uses only the eight clips at the root of this directory.

The upstream repository does not document how its MP3s were extracted, so these
are reference-site assets rather than independently verified PS1 recordings.

Gameplay references for the original 1997 game:

- White damage and green recovery: https://www.yinza.com/Fandom/Script/12.html
- Critical multiplier, random damage variation, and 25% near-death threshold:
  https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/faqs/22395
- Original Healing Wind restores 50% HP, unlike this portfolio's full restore:
  https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/faqs/36775

Clicking the portrait, its hit animation, HP/MP totals, and fixed attack power/
critical probability are portfolio adaptations. Physical hits do not spend MP.
