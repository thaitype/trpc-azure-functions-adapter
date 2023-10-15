import test from "ava";
import { sum } from "./main";

test("test sum", (t) => {
  t.is(sum(1, 2), 3);
});
