// internal
import { LinkedListNode } from './LinkedListNode';

// types
export type PossibleLinkedListNode<T> = LinkedListNode<T> | null;

// implement restricted linked list
export class LinkedList<T> {
  private head: PossibleLinkedListNode<T>;

  private tail: PossibleLinkedListNode<T>;

  private length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  size(): number {
    return this.length;
  }

  push(value: T): void {
    const node = new LinkedListNode(value);

    // increase size
    this.length += 1;

    // when there is no head yet let's make new node a head.
    if (!this.head) {
      this.head = node;
      this.tail = node;
    }

    // attach new node to the end of linked list.
    if (this.tail) {
      this.tail.next = node;
      this.tail = node;
    }
  }

  shift(): PossibleLinkedListNode<T> {
    if (!this.head) {
      return null;
    }

    // destruct head before reassign
    const { head } = this;

    // decrease size
    this.length -= 1;

    if (this.head.next) {
      this.head = this.head.next;
    } else {
      this.head = null;
      this.tail = null;
    }

    return head;
  }

  restore(): this {
    this.head = null;
    this.tail = null;

    return this;
  }
}
