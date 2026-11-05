"""Contraprovas do fiscal do pacote portátil, sem dependências do aplicativo."""

import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch


FONTE = Path(__file__).resolve().parents[1] / "skills/g3-design-v2"
SPEC = importlib.util.spec_from_file_location("fiscal_skill", FONTE / "scripts/validar_pacote.py")
FISCAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(FISCAL)


class FiscalDoPacote(unittest.TestCase):
    def setUp(self):
        self.temporario = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporario.cleanup)
        self.copia = Path(self.temporario.name) / "outro-projeto/g3-design-v2"
        shutil.copytree(FONTE, self.copia, ignore=shutil.ignore_patterns("__pycache__"))

    def editar_entrada(self, trecho):
        with (self.copia / "SKILL.md").open("a", encoding="utf-8") as arquivo:
            arquivo.write(trecho)

    def test_copia_independente_conserva_recursos_e_paleta(self):
        self.assertEqual(FISCAL.validar(self.copia), [])

    def test_link_quebrado_recusa_pacote(self):
        (self.copia / "references/geometria.md").unlink()
        self.assertTrue(any("LINK_QUEBRADO" in e for e in FISCAL.validar(self.copia)))

    def test_link_relativo_nao_acessa_arquivo_fora_do_pacote(self):
        (self.copia.parent / "fora.txt").write_text("dado fictício", encoding="utf-8")
        self.editar_entrada("\n[arquivo](../fora.txt)\n")
        self.assertTrue(any("LINK_FORA_DO_PACOTE" in e for e in FISCAL.validar(self.copia)))

    def test_url_de_arquivo_local_recusa_pacote(self):
        self.editar_entrada("\n[arquivo](file:///tmp/arquivo-ficticio.txt)\n")
        self.assertTrue(any("LINK_ESQUEMA_INVALIDO" in e for e in FISCAL.validar(self.copia)))

    def test_referencia_a_maquina_de_origem_recusa_pacote(self):
        self.editar_entrada("\nImporte C:/Users/Ficticio/modelo.css\n")
        self.assertTrue(any("ACOPLAMENTO_LOCAL" in e for e in FISCAL.validar(self.copia)))

    def test_arquivo_obrigatorio_ausente_recusa_pacote(self):
        (self.copia / "agents/openai.yaml").unlink()
        self.assertTrue(any("RECURSO_AUSENTE" in e for e in FISCAL.validar(self.copia)))

    def test_cor_invisivel_recusa_pacote(self):
        caminho = self.copia / "assets/papeis-de-cor.json"
        dados = json.loads(caminho.read_text(encoding="utf-8"))
        dados["temas"]["claro"]["texto"] = dados["temas"]["claro"]["superficie"]
        caminho.write_text(json.dumps(dados), encoding="utf-8")
        self.assertTrue(any("CONTRASTE" in e for e in FISCAL.validar(self.copia)))

    def test_paleta_com_estrutura_invalida_recusa_sem_excecao(self):
        (self.copia / "assets/papeis-de-cor.json").write_text('{"temas":{"claro":[]}}', encoding="utf-8")
        self.assertTrue(any("PALETA" in e for e in FISCAL.validar(self.copia)))

    def test_paleta_com_raiz_ou_modos_invalidos_recusa_sem_excecao(self):
        for dados in ([], {"temas": []}, {"temas": "texto"}, {"temas": None}):
            with self.subTest(dados=dados):
                (self.copia / "assets/papeis-de-cor.json").write_text(json.dumps(dados), encoding="utf-8")
                self.assertTrue(any("PALETA" in e for e in FISCAL.validar(self.copia)))

    def test_caminho_local_em_metadados_recusa_pacote(self):
        with (self.copia / "agents/openai.yaml").open("a", encoding="utf-8") as arquivo:
            arquivo.write("\n# Use C:/Users/Ficticio/modelo.css\n")
        self.assertTrue(any("ACOPLAMENTO_LOCAL" in e for e in FISCAL.validar(self.copia)))

    def test_link_markdown_por_referencia_ausente_recusa_pacote(self):
        self.editar_entrada("\n[geometria][g]\n\n[g]: references/ausente.md\n")
        self.assertTrue(any("LINK_QUEBRADO" in e for e in FISCAL.validar(self.copia)))

    def test_caminho_codificado_nao_sai_do_pacote(self):
        self.editar_entrada("\n[arquivo](%2e%2e/fora.txt)\n")
        self.assertTrue(any("LINK_FORA_DO_PACOTE" in e for e in FISCAL.validar(self.copia)))

    def test_erro_de_leitura_nao_produz_aprovacao(self):
        leitura = Path.read_text
        def negar(caminho, *args, **kwargs):
            if caminho == self.copia / "references/geometria.md":
                raise PermissionError("negação fictícia")
            return leitura(caminho, *args, **kwargs)
        with patch.object(Path, "read_text", negar):
            self.assertTrue(any("LEITURA" in e for e in FISCAL.validar(self.copia)))

    def test_links_de_arquivo_e_pasta_recusados(self):
        destino = self.copia.parent / "externo"
        destino.mkdir()
        (destino / "conteudo.md").write_text("dado fictício", encoding="utf-8")
        try:
            (self.copia / "atalho").symlink_to(destino, target_is_directory=True)
            arquivo = self.copia / "agents/openai.yaml"
            arquivo.unlink()
            arquivo.symlink_to(destino / "conteudo.md")
        except OSError as erro:
            self.skipTest(f"SO não permitiu criar link simbólico: {erro.errno}")
        falhas = FISCAL.validar(self.copia)
        for esperado in ("LINK_DE_PASTA", "LINK_DE_ARQUIVO", "RECURSO_AUSENTE"):
            self.assertTrue(any(esperado in e for e in falhas))


if __name__ == "__main__":
    unittest.main()
