import Address from "@src/classes/Address"

export default class User {
    id: number
    name: string = ""
    address: Address

    constructor(name: string, address: Address, id: number=-1) {
        if(name.length < 3)
            throw new Error("Nome de usuário precisa ter pelo menos 3 caracteres!")
        this.name = name
        this.address = address
        this.id = id
    }

    isEqual(anotherUser: User) {
        let sameAddress = true
        Object.keys(this.address).find(key => {
            if(key == "cep") {
                sameAddress = this.address.cep.cep == anotherUser.address.cep.cep
            } else {
                sameAddress = Object(this.address)[key] == Object(anotherUser.address)[key]
            }
            return !sameAddress
        })
        
        return (
            this.name === anotherUser.name
            && sameAddress
        )
    }

}