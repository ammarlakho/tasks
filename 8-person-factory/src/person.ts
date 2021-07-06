import { NameChange as NameChangeEvent } from "../generated/templates/Person/Person"
import { PersonDetail } from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";



export function handleNameChange(event: NameChangeEvent): void {
    log.info("Start handleNameChange", []);
    let person_details = PersonDetail.load(event.params.contractAddress.toHexString());
    if(!person_details) {
        person_details = new PersonDetail(event.params.contractAddress.toHexString());
    }
    person_details.name = event.params.newName
    person_details.save();
    log.info("End handleNameChange", []);
}
