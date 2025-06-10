import { LAYOUT_LANGUAGES } from "@src/components/constants/layout";
import { InterNationalization } from "@dtos/layout";

export const interNationalization: InterNationalization[] = [
  {
    _id: 1,
    language: "English",
    flag: "https://images.kcubeinfotech.com/domiex/images/flag/us.svg",
    code: LAYOUT_LANGUAGES.ENGLISH,
  },
  {
    _id: 2,
    language: "Arabic",
    flag: "https://images.kcubeinfotech.com/domiex/images/flag/sa.svg",
    code: LAYOUT_LANGUAGES.ARABIC,
  },
];
