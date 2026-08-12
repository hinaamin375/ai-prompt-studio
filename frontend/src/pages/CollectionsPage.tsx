import {
  CollectionManager,
} from "../features/collections/components/CollectionManager";


export function CollectionsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            PROMPT ORGANIZATION
          </p>

          <h1>
            Collections
          </h1>

          <p className="page-description">
            Create and manage collections
            for organizing your prompt
            library.
          </p>
        </div>
      </div>


      <CollectionManager />
    </div>
  );
}