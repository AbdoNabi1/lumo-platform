import { ValueObject } from "@platform/domain";

export type PublishStateValue = "draft" | "published" | "archived";

interface PublishStateProps {
  readonly value: PublishStateValue;
}

/** A product's lifecycle state. */
export class PublishState extends ValueObject<PublishStateProps> {
  static draft(): PublishState {
    return new PublishState({ value: "draft" });
  }

  static published(): PublishState {
    return new PublishState({ value: "published" });
  }

  static archived(): PublishState {
    return new PublishState({ value: "archived" });
  }

  get value(): PublishStateValue {
    return this.props.value;
  }

  get isPublished(): boolean {
    return this.props.value === "published";
  }
}
