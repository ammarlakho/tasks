import { DataSourceTemplate, log } from "@graphprotocol/graph-ts"
import { NewPerson as NewPersonEvent } from "../generated/PersonFactory/PersonFactory"
import { NewPerson } from "../generated/schema"
import { Person } from "../generated/templates"

export function handleNewPerson(event: NewPersonEvent): void {
  log.info("Start handleNewPerson", []);
  log.warning("Yo: {}", [event.params.personAddress.toString()]);
  let entity = new NewPerson(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.personAddress = event.params.personAddress; 
  Person.create(event.params.personAddress)
  entity.save()

  log.info("End handleNewPerson", []);
}
