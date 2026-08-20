import type {
  Provider,
} from "../types/playground";


interface ProviderSelectorProps {
  providers: Provider[];

  providerId: string;
  model: string;

  disabled?: boolean;

  onProviderChange: (
    providerId: string,
  ) => void;

  onModelChange: (
    model: string,
  ) => void;
}


export function ProviderSelector({
  providers,
  providerId,
  model,
  disabled = false,
  onProviderChange,
  onModelChange,
}: ProviderSelectorProps) {
  const selectedProvider =
    providers.find(
      (provider) =>
        provider.id === providerId,
    );

  return (
    <div className="playground-provider-grid">
      <div className="playground-field">
        <label htmlFor="playground-provider">
          Provider
        </label>

        <select
          id="playground-provider"
          value={providerId}
          disabled={
            disabled ||
            providers.length === 0
          }
          onChange={(event) =>
            onProviderChange(
              event.target.value,
            )
          }
        >
          {providers.map((provider) => (
            <option
              key={provider.id}
              value={provider.id}
            >
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      <div className="playground-field">
        <label htmlFor="playground-model">
          Model
        </label>

        <select
          id="playground-model"
          value={model}
          disabled={
            disabled ||
            !selectedProvider
          }
          onChange={(event) =>
            onModelChange(
              event.target.value,
            )
          }
        >
          {selectedProvider?.models.map(
            (providerModel) => (
              <option
                key={providerModel}
                value={providerModel}
              >
                {providerModel}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  );
}