export class LinkedListNode<T = any> {
  public value: T;

  public next: LinkedListNode<T> | null;

  constructor(value: T, next = null) {
    this.value = value;
    this.next = next;
  }
}
