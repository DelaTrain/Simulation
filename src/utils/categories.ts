import { TrainCategory } from "../core/trainCategory";

const DEFAULT_CATEGORIES: Record<string, TrainCategory> = {
    eip: new TrainCategory("EIP", "Express InterCity Premium", 1, 20 * 60, 55.6, 0.6),
    eic: new TrainCategory("EIC", "Express InterCity", 2, 25 * 60, 55.6, 0.5),
    ec: new TrainCategory("EC", "EuroCity", 2, 30 * 60, 55.6, 0.5),
    en: new TrainCategory("EN", "EuroNight", 3, 35 * 60, 44.4, 0.3),
    ic: new TrainCategory("IC", "InterCity", 3, 30 * 60, 44.4, 0.4),
    d: new TrainCategory("D", "Pociąg dalekobieżny", 4, 35 * 60, 44.4, 0.35),
    tlk: new TrainCategory("TLK", "Tanie Linie Kolejowe", 4, 35 * 60, 38.9, 0.35),
    ir: new TrainCategory("IR", "InterRegio", 5, 30 * 60, 38.9, 0.35),
    ar: new TrainCategory("AR", "Accelerated Regional", 5, 25 * 60, 38.9, 0.45),
    r: new TrainCategory("R", "Regio", 6, 20 * 60, 33.3, 0.4),
    km: new TrainCategory("KM", "Koleje Mazowieckie", 6, 20 * 60, 33.3, 0.4),
    kd: new TrainCategory("KD", "Koleje Dolnośląskie", 6, 20 * 60, 44.4, 0.45),
    le: new TrainCategory("LE", "Lokalny Ekspres", 6, 20 * 60, 33.3, 0.45),
    skm: new TrainCategory("SKM", "Szybka Kolej Miejska", 6, 15 * 60, 30.6, 0.5),
    skw: new TrainCategory("SKW", "Szybka Kolej Miejska Warszawa", 6, 15 * 60, 30.6, 0.55),
    wkd: new TrainCategory("WKD", "Warszawska Kolej Dojazdowa", 6, 10 * 60, 25.0, 0.6),
    zka: new TrainCategory("ZKA", "Zastępcza Komunikacja Autobusowa", 6, 20 * 60, 33.3, 0.4),
    l: new TrainCategory("L", "Pociąg lokalny", 7, 15 * 60, 30.6, 0.35),
    ls: new TrainCategory("LS", "Lokalny sezonowy", 7, 15 * 60, 30.6, 0.35),
    ks: new TrainCategory("KS", "Koleje Śląskie", 7, 15 * 60, 30.6, 0.35),
    kw: new TrainCategory("KW", "Koleje Wielkopolskie", 7, 15 * 60, 30.6, 0.35),
    lp: new TrainCategory("LP", "Linia podmiejska", 7, 15 * 60, 30.6, 0.35),
    kml: new TrainCategory("KML", "Kolej Metropolitalna", 7, 15 * 60, 30.6, 0.35),
    os: new TrainCategory("OS", "Pociąg osobowy", 8, 15 * 60, 30.6, 0.3),
    bus: new TrainCategory("BUS", "Autobus", 9, 10 * 60, 22.2, 0.25),
    default: new TrainCategory("DEFAULT", "Nieznana kategoria", 10, 15 * 60, 27.8, 0.3),
};

class CategoryManager {
    private categories: Record<string, TrainCategory>;

    constructor() {
        this.categories = DEFAULT_CATEGORIES;
    }

    getCategories(): TrainCategory[] {
        return Object.values(this.categories).sort((a, b) => a.name.localeCompare(b.name));
    }

    getCategory(name: string): TrainCategory {
        if (this.categories[name] === undefined) console.warn("Category not found:", name);
        return this.categories[name] === undefined ? this.categories["default"] : this.categories[name];
    }

    mapCategory(name: string): TrainCategory {
        return this.getCategory(name.toLowerCase());
    }
}

export const categoryManager = new CategoryManager();
