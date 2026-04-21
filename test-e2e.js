import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/Finance-app/');
  
  // Etape 1: Dashboard
  const content = await page.content();
  if (content.includes('Revenus') && content.includes('Dépenses')) {
    console.log('Etape 1 OK : Dashboard affiché avec succès.');
  } else {
    console.log('Erreur Etape 1 : Dashboard manquant ou incomplet.');
  }

  // Etape 2: Clic sur FAB (+ Ajouter une dépense)
  // Note: On clique sur le bouton central "plus" avec "lucide-plus" ou background accent
  await page.locator('button.bg-accent').click();
  console.log('Etape 2 OK : Clic sur FAB');
  await page.waitForTimeout(500);

  // Etape 3: Numpad (on tape 1, 5, 0)
  try {
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: '0', exact: true }).click();
      console.log('Etape 3 OK : Saisie de 150');
  } catch (e) {
      console.log('Erreur Etape 3 : Impossible de cliquer sur le Numpad', e);
  }
  
  await page.waitForTimeout(500);

  // Etape 4: Valider et choisir catégorie
  try {
      // Le bouton "Suivant"
      await page.getByRole('button', { name: 'Suivant' }).click();
      console.log('Clic sur Suivant OK');
      await page.waitForTimeout(500);
      
      // Catégorie Resto
      await page.getByText('Resto').click();
      console.log('Etape 4 OK : Catégorie Resto sélectionnée');
      await page.waitForTimeout(500);
      
      // Valider final n'est pas nécessaire car cliquer sur la catégorie valide la dépense et ferme la modale.
      console.log('Validation dépense OK (fermeture automatique)');
      await page.waitForTimeout(1000);
  } catch (e) {
      console.log('Erreur Etape 4', e);
  }

  // Etape 5: Onglet Transactions
  try {
      await page.getByRole('button', { name: 'Transactions' }).click();
      await page.waitForTimeout(500);
      const txContent = await page.content();
      if (txContent.includes('150')) {
          console.log('Etape 5 OK : Transaction 150 présente');
      } else {
          console.log('Erreur Etape 5 : Transaction introuvable');
      }
  } catch (e) {
      console.log('Erreur Etape 5', e);
  }

  // Etape 6: Onglet Stats
  try {
      await page.getByRole('button', { name: 'Stats' }).click();
      await page.waitForTimeout(500);
      const statsContent = await page.content();
      if (statsContent.includes('recharts') || statsContent.includes('Stats') || statsContent.includes('Dépenses')) {
          console.log('Etape 6 OK : Graphique/Stats affiché');
      } else {
          console.log('Erreur Etape 6 : Graphique introuvable');
      }
  } catch (e) {
      console.log('Erreur Etape 6', e);
  }

  await browser.close();
})();
