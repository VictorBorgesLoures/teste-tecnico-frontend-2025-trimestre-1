export default class CEP {
    cep: string = ""

    constructor(cep: string) {
        if(!CEP.isValidCEP(cep))
            throw Error("Formato de CEP inválido!\nDeve ser ddddd-ddd")
        this.cep = cep;
    }

    static isValidCEP(cep: string): boolean {
        if (isNaN(parseInt(cep.replace('-',''))))
            return false
        if(cep.length != 9)
            return false
        return cep.includes('-')
    }
}