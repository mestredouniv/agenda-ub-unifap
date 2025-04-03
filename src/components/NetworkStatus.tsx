
import { NetworkStatus as NewNetworkStatus } from "./ui/network-status";

// Componente legado redirecionado para o novo componente
export const NetworkStatus = (props: any) => {
  return <NewNetworkStatus {...props} />;
};

export default NetworkStatus;
