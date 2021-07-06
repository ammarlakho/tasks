import {
  Approval as ApprovalEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent
} from "../generated/Token20/Token20"
import { Approval, OwnershipTransferred, Transfer, User} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value
  
  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner
  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let transferIdentity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  transferIdentity.from = event.params.from;
  transferIdentity.to = event.params.to;
  transferIdentity.value = event.params.value;
  transferIdentity.save();

  let userFrom = User.load(event.params.from.toHexString());
  let userTo = User.load(event.params.to.toHexString());
  
  if(userFrom) {
    userFrom.balance = userFrom.balance.minus(event.params.value);
    userFrom.save();
  }

  if(!userTo) {
    userTo = new User(event.params.to.toHexString());
    userTo.balance = event.params.value;
  }
  else {
    userTo.balance = userTo.balance.plus(event.params.value);
  }
  userTo.save();
}
