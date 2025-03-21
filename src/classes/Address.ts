import CEP from "@src/classes/CEP"
import { ViaCEPResponse } from "@src/models"
import axios from 'axios'

export default class Address {
    name: string = ""
    cep: CEP
    logradouro: string = ""
    complemento: string = ""
    unidade: string = ""
    bairro: string = ""
    localidade = ""
    uf: string = ""
    estado: string = ""

    constructor(name: string, cep: CEP, address?: Address) {
        this.setAddressName(name)
        this.cep = cep;
        if(address) {
            this.logradouro = address['logradouro']
            this.complemento= address['complemento']
            this.unidade= address['unidade']
            this.bairro= address['bairro']
            this.localidade = address['localidade']
            this.uf = address['uf']
            this.estado = address['estado']
        }
    }

    setAddressName(name: string) {
        if(name.length < 3)
            throw new Error("Nome do endereço precisa ter pelo menos 3 caracteres!")
        this.name = name
    }

    static async create(name: string, cep: CEP): Promise<Address | null> {
        let address = new Address(name, cep)
        const data = await address._fetchCEPAddress()
        if (data == null || data['erro'])
            throw new Error("CEP inválido!")
        address.logradouro = data['logradouro']
        address.complemento= data['complemento']
        address.unidade= data['unidade']
        address.bairro= data['bairro']
        address.localidade = data['localidade']
        address.uf = data['uf']
        address.estado = data['estado']
        return address
    } 

    _fetchCEPAddress(): Promise<ViaCEPResponse | null> {
        return axios.get(`https://viacep.com.br/ws/${this.cep.cep.replace('-', '')}/json/`)
            .then((resp) => {
                if (resp.status == 200) 
                    return resp.data as ViaCEPResponse                
                return null
            })
            .catch(e => {
                throw Error("Não foi possível acessar o ViaCEP")
            })
    }
}