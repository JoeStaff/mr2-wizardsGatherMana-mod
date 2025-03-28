import { MR2, MR2Globals } from "magic-research-2-modding-sdk";
import { DoActionArgs } from "magic-research-2-modding-sdk/modding-decs/backend/action/Action";
import { ActionArea, ActionSubcategory } from "magic-research-2-modding-sdk/modding-decs/backend/action/ActionAreas";
import { SpellAutocastCategory } from "magic-research-2-modding-sdk/modding-decs/backend/autocast/SpellAutocastCategory";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { Resource } from "magic-research-2-modding-sdk/modding-decs/backend/Resources";
import { SpellElement, SpellElementType } from "magic-research-2-modding-sdk/modding-decs/backend/spells/Elements";

const PACKAGE = require("../package.json");

function hideGatherManaAction(MR2: MR2Globals) {
  const gatherMana = MR2.Actions.getById("gatherMana");
  gatherMana.isVisible = (state: GameState) => {
    return false;
  };
}

function buildGatherManaSpell(MR2: MR2Globals) {

  class GatherManaSpell extends (MR2.Spell) {
    getId(): string {
        return "gatherManaSpell";
    }

    getSpellName(): string {
        return "Gather Mana";
    }

    getDisplayDescription(state: GameState): string {
        return MR2.Actions.getById("gatherMana").getDisplayDescription(state);
    }

    getAreas(): Partial<Record<ActionArea, ActionSubcategory[]>> {
      return {
        HOME:[MR2.ActionSubcategories.ACTIONS],
        SPELL_MENU:MR2.Spells.getAll()
        .map(spell => spell.getId())               // Get all spell IDs
        .filter(id => id.startsWith("channel"))    // Keep only those starting with "channel"
        .map(id => id.substring(7))                // Remove "channel" (7 characters)
        .filter(name => name.length > 0)
      };
    }

    getAutocastCategory(): SpellAutocastCategory {
        return MR2.SpellAutocastCategory.CHANNELING;
    }

    getTags(): string[] {
        return MR2.Spells.getAll()
        .map(spell => spell.getId())               // Get all spell IDs
        .filter(id => id.startsWith("channel"))    // Keep only those starting with "channel"
        .map(id => id.substring(7))                // Remove "channel" (7 characters)
        .filter(name => name.length > 0);
    }

    getCost(state: GameState): {
        resources: Partial<Record<Resource, number>>;
        items: Record<string, number>;
    } {
        return {
            resources: { },
            items: {}
        };
    }

    getManaCost(state: GameState): number {
        return 0; // Example mana cost
    }

    getDisplayEffect(state: GameState): string {
        return MR2.Actions.getById("gatherMana").getDisplayEffect(state);
    }

    isVisible(state: GameState): boolean {
        return true;
    }

    isEnabled(state: GameState, skipAffordabilityChecks?: boolean): boolean {
      return (
        MR2.getResourceAmount(state, MR2.Resource.Mana) <
        MR2.getResourceCap(state, MR2.Resource.Mana)
      );
    }

    getLevelRequirements(): Partial<Record<SpellElement, number>> {
        return { };
    }

    getExpFromUsage(state: GameState): {} {
        return {};
    }

    getTotalEssencesToGrant(state: GameState): Partial<Record<Resource, number>> {
        return { };
    }

    doSpellAction(state: GameState, args: DoActionArgs): GameState {
        
      return MR2.grantResource(
        MR2.Resource.Mana,
        MR2.Actions.getById("gatherMana").getActionEffect(state,"mana")
        )(state);
    }

    isCastingRecommended(state: GameState): boolean {
        return true;
    }

    getElement(): SpellElementType | undefined {
        return undefined; // This spell does not belong to a single element
    }

    getBaseManaCost(state: GameState): number {
        return 0;
    }
}

  const gatherManaSpell = new GatherManaSpell();
  MR2.registerSpell(gatherManaSpell);
}

export function load(MR2: MR2Globals) {
  hideGatherManaAction(MR2);
  buildGatherManaSpell(MR2);
}

export const id = PACKAGE.name;
export const name = PACKAGE.description;
export const version = PACKAGE.version;
export const description =
  "A mod that allows wizards to gather mana like they can essence.";
