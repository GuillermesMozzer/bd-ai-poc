export type GapFreeSequenceItem = {
  proposedStartDateTime: string;
  proposedEndDateTime: string;
};

export function validateNoGapsInLineSequence(sequenceItems: GapFreeSequenceItem[]) {
  if (sequenceItems.length < 2) {
    return true;
  }

  for (let index = 1; index < sequenceItems.length; index += 1) {
    if (sequenceItems[index - 1].proposedEndDateTime !== sequenceItems[index].proposedStartDateTime) {
      return false;
    }
  }

  return true;
}
