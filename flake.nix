{
    description = "Amplify Todo → AWS Blocks ハンズオン（Node.js / npm 環境を Nix で隔離）";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils }:
        flake-utils.lib.eachDefaultSystem (system:
            let
                pkgs = nixpkgs.legacyPackages.${system};
            in {
                devShells.default = pkgs.mkShell {
                    packages = with pkgs; [
                        nodejs_22
                        git
                        curl
                    ];

                    shellHook = ''
                        echo "hands-on-walkthrough dev shell (Node $(node -v), npm $(npm -v))"
                        export npm_config_cache="$PWD/.npm-cache"
                        mkdir -p "$npm_config_cache"
                        if [ -f .env.local ]; then
                          set -a
                          source .env.local
                          set +a
                          echo "Loaded .env.local (AWS_PROFILE=''${AWS_PROFILE:-unset})"
                        else
                          echo "Tip: cp .env.local.example .env.local and set AWS_PROFILE for sandbox"
                        fi
                    '';
                };
            });
}
