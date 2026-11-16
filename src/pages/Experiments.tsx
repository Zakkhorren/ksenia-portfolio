import { CollectionHeader, EndNavigation } from "../components/Shared";
import ExperimentDesktop from "../components/ExperimentDesktop";

export default function Experiments() {
  return <>
    <CollectionHeader slug="experiments" />
    <ExperimentDesktop />
    <p class="that-is-all experiments-end">НА ЭТОМ ВСЁ <em>пока что :)</em></p>
    <EndNavigation slug="experiments" />
  </>;
}
