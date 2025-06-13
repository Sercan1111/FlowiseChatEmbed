export interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
}
export declare const countries: Country[];
export declare const getCountryByCode: (code: string) => Country | undefined;
export declare const getCountryByDialCode: (dialCode: string) => Country | undefined;
export declare const formatPhoneNumber: (phoneNumber: string, country: Country) => string;
export declare const parsePhoneInput: (input: string) => {
    country?: Country;
    nationalNumber: string;
};
