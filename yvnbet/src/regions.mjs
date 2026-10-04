// Suggestions from https://mtad.am/pages/armenian-communities (2026-10-04).
// Not an address validator: users may enter another region or settlement.
const groups = [
  ['Երևան', 'Ереван', 'Yerevan', 'Երևան|Ереван|Yerevan'],
  ['Արագածոտն', 'Арагацотн', 'Aragatsotn', 'Ալագյազ|Алагяз|Alagyaz;Աշտարակ|Аштарак|Ashtarak;Ապարան|Апаран|Aparan;Արևուտ|Аревут|Arevut;Թալին|Талин|Talin;Ծաղկահովիտ|Цахкаовит|Tsaghkahovit;Մեծաձոր|Мецадзор|Metsadzor;Շամիրամ|Шамирам|Shamiram'],
  ['Արարատ', 'Арарат', 'Ararat', 'Արարատ|Арарат|Ararat;Արտաշատ|Арташат|Artashat;Մասիս|Масис|Masis;Վեդի|Веди|Vedi;Վերին Դվին|Верин Двин|Verin Dvin'],
  ['Արմավիր', 'Армавир', 'Armavir', 'Արաքս|Аракс|Araks;Արմավիր|Армавир|Armavir;Բաղրամյան|Баграмян|Baghramyan;Մեծամոր|Мецамор|Metsamor;Վաղարշապատ|Вагаршапат|Vagharshapat;Փարաքար|Паракар|Parakar;Ֆերիկ|Ферик|Ferik'],
  ['Գեղարքունիք', 'Гегаркуник', 'Gegharkunik', 'Գավառ|Гавар|Gavar;Ճամբարակ|Чамбарак|Chambarak;Մարտունի|Мартуни|Martuni;Սևան|Севан|Sevan;Վարդենիս|Варденис|Vardenis'],
  ['Լոռի', 'Лори', 'Lori', 'Ալավերդի|Алаверди|Alaverdi;Գյուլագարակ|Гюлагарак|Gyulagarak;Թումանյան|Туманян|Tumanyan;Լերմոնտովո|Лермонтово|Lermontovo;Լոռի բերդ|Лори Берд|Lori Berd;Սպիտակ|Спитак|Spitak;Ստեփանավան|Степанаван|Stepanavan;Վանաձոր|Ванадзор|Vanadzor;Տաշիր|Ташир|Tashir;Փամբակ|Памбак|Pambak;Ֆիոլետովո|Фиолетово|Fioletovo'],
  ['Կոտայք', 'Котайк', 'Kotayk', 'Աբովյան|Абовян|Abovyan;Ակունք|Акунк|Akunk;Արզնի|Арзни|Arzni;Բյուրեղավան|Бюрегаван|Byureghavan;Գառնի|Гарни|Garni;Ծաղկաձոր|Цахкадзор|Tsaghkadzor;Հրազդան|Раздан|Hrazdan;Նաիրի|Наири|Nairi;Նոր Հաճն|Нор Ачин|Nor Hachn;Չարենցավան|Чаренцаван|Charentsavan;Ջրվեժ|Джрвеж|Jrvezh'],
  ['Շիրակ', 'Ширак', 'Shirak', 'Ախուրյան|Ахурян|Akhuryan;Ամասիա|Амасия|Amasia;Անի|Ани|Ani;Աշոցք|Ашоцк|Ashotsk;Արթիկ|Артик|Artik;Գյումրի|Гюмри|Gyumri'],
  ['Սյունիք', 'Сюник', 'Syunik', 'Գորիս|Горис|Goris;Կապան|Капан|Kapan;Մեղրի|Мегри|Meghri;Սիսիան|Сисиан|Sisian;Տաթև|Татев|Tatev;Տեղ|Тех|Tegh;Քաջարան|Каджаран|Kajaran'],
  ['Վայոց ձոր', 'Вайоц Дзор', 'Vayots Dzor', 'Արենի|Арени|Areni;Եղեգիս|Ехегис|Yeghegis;Եղեգնաձոր|Ехегнадзор|Yeghegnadzor;Ջերմուկ|Джермук|Jermuk;Վայք|Вайк|Vayk'],
  ['Տավուշ', 'Тавуш', 'Tavush', 'Բերդ|Берд|Berd;Դիլիջան|Дилижан|Dilijan;Իջևան|Иджеван|Ijevan;Նոյեմբերյան|Ноемберян|Noyemberyan'],
];
const normalize = (s) => s.toLocaleLowerCase().replaceAll('եւ', 'և').replaceAll('եվ', 'և').trim();
export function regionOptions(lang, query = '') {
  const index = {hy: 0, ru: 1, en: 2}[lang] ?? 2;
  const q = normalize(query);
  return groups.flatMap(([hy, ru, en, entries]) => entries.split(';').map(entry => {
    const names = entry.split('|');
    return {name: names[index], region: [hy, ru, en][index], aliases: normalize(`${entry} ${hy} ${ru} ${en}`)};
  })).filter(o => !q || o.aliases.includes(q)).sort((a,b) => a.name.localeCompare(b.name, lang));
}
