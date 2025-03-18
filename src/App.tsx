import CEP from '@src/classes/CEP'
import Address from '@src/classes/Address'
import User from '@src/classes/User'
import { FormEvent, JSX, MouseEvent, useState } from 'react'
import './App.css'
import UserManager from '@src/classes/UserManager'

import { ToastContainer, ToastContent, ToastContentProps, ToastOptions, toast } from 'react-toastify';

import saveIcon from '@src/assets/icon-save.png'
import trashIcon from '@src/assets/icon-trash.png'

type tableFields =
  | "id"
  | "name"
  | "addressName"
  | "cidade"
  | "estado"

type filter = {
  sort: tableFields,
  search: string
}

const defaultFilter: filter = {
  sort: "id",
  search: ""
}

function App() {
  let userManager = new UserManager()
  
  let [users, changeUsersList] = useState(userManager.get().users)
  let [tableFilter, changeFilter] = useState(defaultFilter) 
  let [formUsername, setUserName] = useState("")
  let [formAddressName, setAddressName] = useState("")
  let [formCEP, setCEP] = useState("")
  let [submitButton, toggleSubmit] = useState(false)

  function clearForm() {
    setAddressName("")
    setCEP("")
    setUserName("")
  }

  function formUserHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toggleSubmit(true)
    try {
      let cep = new CEP(formCEP)
      let user: User | null = null
      Address.create(formAddressName, cep)
      .then(address => {
        if (address != null) {
          user = new User(formUsername, address)
          if (userManager.add(user)) {
            changeUsersList(userManager.users)
            userManager.save()
            toast.success("Usuário inserido!")
            clearForm()
          } else
            toast.info("Usuário já existente!")
        } else
          toast.warn("Não foi possível inserir usuário")
        toggleSubmit(false)
      })
      .catch(e => {
        toast.warning(e.message) 
        toggleSubmit(false)
      })
    } catch (e) {
      toast.warning((e as Error).message) 
      toggleSubmit(false)
    }
  }

  function changeTableFilter(name: tableFields) {
    changeFilter({...tableFilter, sort: name})
  }

  function handleSave(e: MouseEvent<HTMLImageElement, globalThis.MouseEvent>, userId: number) {
    e.preventDefault()
    let index = users.findIndex(u => u.id == userId)
    if(!userManager.alreadyHasUser(new User(users[index].name, users[index].address, users[index].id))) {
      let userIndexManager = userManager.users.findIndex(u => u.id == userId)
      userManager.users[userIndexManager] = users[index]
      userManager.save()
      toast.success("Modificações no usuário foram salvas!")
    } else {
      toast.warn("Um usuário já existe com os mesmos dados.")
    }
  }

  function handleDelete(e: MouseEvent<HTMLImageElement, globalThis.MouseEvent>, userId: number) {
    e.preventDefault()
    let index = users.findIndex(u => u.id == userId)
    if(index == -1) {
      toast.info("Usuário já foi removido.")
    } else {
      users.splice(index, 1)
      changeUsersList([...users])
      userManager.users = users
      userManager.save()
      toast.success("Usuário removido com sucesso!")
    }
  }
  
  function toastConfirmation(message: ToastContent<unknown>, options: ToastOptions<unknown>) {
    toast(message, options)
  }

  return (
    <div className="container">
      <ToastContainer />
      <h1 className="text-center">Gerenciador de usuários</h1>
      <form className="text-left p-5" onSubmit={e => formUserHandler(e)}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Nome: </label>
          <input 
            type="text" 
            className="form-control" 
            id="username" 
            placeholder="Pintacilgo da Silva" 
            value={formUsername}
            onChange={e => setUserName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="addressName" className="form-label">Nome do endereço: </label>
          <input 
            type="text"
            className="form-control" 
            id="addressName"
            placeholder="Casa 1" 
            value={formAddressName}
            onChange={e => setAddressName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="addressName" className="form-label">CEP: </label>
          <input 
            type="text" 
            className="form-control" 
            id="cep" 
            placeholder="23394-234" 
            value={formCEP}
            onChange={e => setCEP(e.target.value)}
          />
        </div>
        <button className='btn btn-primary' type="submit" disabled={submitButton}>Salvar</button>
      </form>
      <h2>Usuários cadastrados: </h2>
      <form className="p-2 row g-3">
        <label htmlFor="search" className="col-sm-2 col-form-label">Procurar endereço: </label>
        <div className="col-sm-5">
          <input type="text" className="form-control" id="search" placeholder="Casa 55" value={tableFilter.search} onChange={
            (e => {
              e.preventDefault()
              changeFilter({...tableFilter, search: e.target.value})
            })
            } />
        </div>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th scope="col" className={
              tableFilter.sort == "id" 
              ? "table-header table-header-active"
              : "table-header"
            } onClick={e => changeTableFilter("id")}>#</th>
            <th scope="col" className={
              tableFilter.sort == "name" 
              ? "table-header table-header-active"
              : "table-header"
            } onClick={e => changeTableFilter("name")}>Nome</th>
            <th scope="col" className={
              tableFilter.sort == "addressName" 
              ? "table-header table-header-active"
              : "table-header"
            } onClick={e => changeTableFilter("addressName")}>Nome endereço</th>
            <th scope="col" className={
              tableFilter.sort == "cidade" 
              ? "table-header table-header-active"
              : "table-header"
            } onClick={e => changeTableFilter("cidade")}>Cidade</th>
            <th scope="col" className={
              tableFilter.sort == "estado" 
              ? "table-header table-header-active"
              : "table-header"
            } onClick={e => changeTableFilter("estado")}>Estado</th>
            <th scope="col">CEP</th>
            <th scope="col">Salvar</th>
            <th scope="col">Remover</th>
          </tr>
        </thead>
        <tbody>
          {
            users.filter(user => {
              if(tableFilter.search.length > 3) {
                if (!user.address.name.toLowerCase().includes(tableFilter.search.toLowerCase()))
                  return
              }
              return user
            }).sort((a,b) => {
              switch(tableFilter.sort) {
                case "id":
                  return a.id > b.id ? 1 : -1
                case "name":
                  return a.name > b.name ? 1 : -1
                case "addressName":
                  return a.address.name > b.address.name ? 1 : -1
                case "cidade":
                  return a.address.localidade > b.address.localidade ? 1 : -1
                case "estado":
                  return a.address.estado > b.address.estado ? 1 : -1
                default:
                  return 0
              }
            }).map((user) => {
              return <tr key={"user-"+user.id}>
                <th scope="row">{user.id+1}</th>
                <td>{user.name}</td>
                <td><input className="form-control" type="text" value={user.address.name} onChange={e => {
                  e.preventDefault()
                  users.forEach(u => {
                    if(u.id == user.id) {
                      u.address.name = e.target.value
                      return
                    }
                  })
                  changeUsersList([...users])
                }}/></td>
                <td>{user.address.localidade}</td>
                <td>{user.address.estado}</td>
                <td>{user.address.cep.cep}</td>
                <td><img src={saveIcon} data-user-id={user.id} className="btn btn-light"
                  onClick={(e) =>  toastConfirmation(({ closeToast }: ToastContentProps) => {
                    return (<div>
                      <p>Você deseja salvar?</p>
                      <button className="btn m-2 btn-success" onClick={() => closeToast(true)}>Salvar</button>
                      <button className="btn btn-primary" onClick={() => closeToast(false)}>Ignorar</button>
                    </div>)
                  }, {
                    onClose(reply) {
                      switch(reply) {
                        case true:
                          handleSave(e, user.id)
                          break
                        default:
                          break
                      }
                    }
                  })}
                /></td>
                <td><img src={trashIcon}
                  className="btn btn-danger"
                  onClick={(e) =>  toastConfirmation(({ closeToast }: ToastContentProps) => {
                    return (<div>
                      <p>Confirmar exclusão de usuário?</p>
                      <button className="btn m-2 btn-danger" onClick={() => closeToast(true)}>Deletar</button>
                      <button className="btn btn-primary" onClick={() => closeToast(false)}>Ignorar</button>
                    </div>)
                  }, {
                  onClose(reply) {
                    switch(reply) {
                      case true:
                        handleDelete(e, user.id)
                        break
                      default:
                        break
                    }
                  }
                })}
                /></td>
              </tr>
            })
          }
        </tbody>
      </table>
      
    </div>
  )
}

export default App
