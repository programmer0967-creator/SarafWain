// Currency definitions

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  nameAr: string;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', nameAr: 'دولار أمريكي' },
  { code: 'EUR', symbol: '€', name: 'Euro', nameAr: 'يورو' },
  { code: 'GBP', symbol: '£', name: 'British Pound', nameAr: 'جنيه إسترليني' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', nameAr: 'ريال سعودي' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', nameAr: 'درهم إماراتي' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', nameAr: 'جنيه مصري' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', nameAr: 'دينار أردني' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', nameAr: 'ريال قطري' },
  { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', nameAr: 'ريال عماني' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', nameAr: 'دينار بحريني' },
  { code: 'IQD', symbol: 'د.ع', name: 'Iraqi Dinar', nameAr: 'دينار عراقي' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', nameAr: 'ليرة لبنانية' },
  { code: 'SYP', symbol: 'ل.س', name: 'Syrian Pound', nameAr: 'ليرة سورية' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', nameAr: 'دينار تونسي' },
  { code: 'MAD', symbol: 'د.م', name: 'Moroccan Dirham', nameAr: 'درهم مغربي' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar', nameAr: 'دينار جزائري' },
  { code: 'LYD', symbol: 'د.ل', name: 'Libyan Dinar', nameAr: 'دينار ليبي' },
  { code: 'SDG', symbol: 'ج.س', name: 'Sudanese Pound', nameAr: 'جنيه سوداني' },
  { code: 'YER', symbol: 'ر.ي', name: 'Yemeni Rial', nameAr: 'ريال يمني' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', nameAr: 'ليرة تركية' },
];
