import User from "@src/classes/User";

export default class UserManager {

    users: User[] = []

    add(user: User): boolean {
        let alreadyHasUser = this.alreadyHasUser(user)
        if (alreadyHasUser === undefined) {
            user.id = this._getNextId()
            this.users.push(user)
            return true
        }
        return false
    }

    alreadyHasUser(user: User) {
        return this.users.find((currentUser => {
            return user.isEqual(currentUser)
        }))
    }

    _getNextId() {
        let id = 0

        this.users.forEach(user => {
            if (id <= user.id)
                id = user.id+1
        })

        return id
    }

    get() {
        let usersString = localStorage.getItem('users')
        if (usersString == null)
            this.users = []
        else {
            this.users = JSON.parse(usersString)
        }
        return this
    }

    save() {
        localStorage.setItem('users', JSON.stringify(this.users))
    }
}