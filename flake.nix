{
  description = "HackTheBurgh 2026 dev shell (web: Node/pnpm, tools: uv/Python)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_22
            pkgs.nodePackages.pnpm
            pkgs.uv
            pkgs.python314
          ];

          shellHook = ''
            echo "htb-2026 dev shell: node $(node --version 2>/dev/null), pnpm $(pnpm --version 2>/dev/null), uv $(uv --version 2>/dev/null)"
          '';
        };
      });
    };
}
