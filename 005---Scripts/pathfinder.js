class Pathfinder {
    __evaluate(args) {
        const { fieldValue, dv } = args;
        const result = dv.evaluate(fieldValue);

        if (!result.successful) {
            console.error(`Failed to evaluate field: ${fieldValue}. Error: ${result.error}`);
            return null;
        }
        return result.value;
    }

    static get SKILLS() {
        return {
            "Fortitude": {
                mod: "ConstitutionMod",
                proficiency: "FortitudeProficiency",
            },
            "Reflex": {
                mod: "DexterityMod",
                proficiency: "ReflexProficiency",
            },
            "Will": {
                mod: "WisdomMod",
                proficiency: "WillProficiency",
            },
            "Perception": {
                mod: "WisdomMod",
                proficiency: "PerceptionProficiency",
            },
            "Acrobatics": {
                mod: "DexterityMod",
                proficiency: "AcrobaticsProficiency",
            },
            "Arcana": {
                mod: "IntelligenceMod",
                proficiency: "ArcanaProficiency",
            },
            "Athletics": {
                mod: "StrengthMod",
                proficiency: "AthleticsProficiency",
            },
            "Crafting": {
                mod: "IntelligenceMod",
                proficiency: "CraftingProficiency",
            },
            "Deception": {
                mod: "CharismaMod",
                proficiency: "DeceptionProficiency",
            },
            "Diplomacy": {
                mod: "CharismaMod",
                proficiency: "DiplomacyProficiency",
            },
            "Intimidation": {
                mod: "CharismaMod",
                proficiency: "IntimidationProficiency",
            },
            "Medicine": {
                mod: "WisdomMod",
                proficiency: "MedicineProficiency",
            },
            "Nature": {
                mod: "WisdomMod",
                proficiency: "NatureProficiency",
            },
            "Occultism": {
                mod: "IntelligenceMod",
                proficiency: "OccultismProficiency",
            },
            "Performance": {
                mod: "CharismaMod",
                proficiency: "PerformanceProficiency",
            },
            "Religion": {
                mod: "WisdomMod",
                proficiency: "ReligionProficiency",
            },
            "Society": {
                mod: "WisdomMod",
                proficiency: "SocietyProficiency",
            },
            "Stealth": {
                mod: "DexterityMod",
                proficiency: "StealthProficiency",
            },
            "Survival": {
                mod: "WisdomMod",
                proficiency: "SurvivalProficiency",
            },
            "Thievery": {
                mod: "WisdomMod",
                proficiency: "ThieveryProficiency",
            },
        };
    }

    getAbilitiesObject(args) {
        const { path, dv } = args;
        const page = dv.page(path);

        return {
            StrengthMod: this.__evaluate({ fieldValue: page.StrengthModFormula, dv }),
            DexterityMod: this.__evaluate({ fieldValue: page.DexterityModFormula, dv }),
            ConstitutionMod: this.__evaluate({ fieldValue: page.ConstitutionModFormula, dv }),
            IntelligenceMod: this.__evaluate({ fieldValue: page.IntelligenceModFormula, dv }),
            WisdomMod: this.__evaluate({ fieldValue: page.WisdomModFormula, dv }),
            CharismaMod: this.__evaluate({ fieldValue: page.CharismaModFormula, dv }),
        };
    }

    getSkillsProficienciesObject(args) {
        const { path, dv } = args;
        const page = dv.page(path);

        return {
            FortitudeProficiency: page.FortitudeProficiency,
            ReflexProficiency: page.ReflexProficiency,
            WillProficiency: page.WillProficiency,
            PerceptionProficiency: page.PerceptionProficiency,
            AcrobaticsProficiency: page.AcrobaticsProficiency,
            ArcanaProficiency: page.ArcanaProficiency,
            AthleticsProficiency: page.AthleticsProficiency,
            CraftingProficiency: page.CraftingProficiency,
            DeceptionProficiency: page.DeceptionProficiency,
            DiplomacyProficiency: page.DiplomacyProficiency,
            IntimidationProficiency: page.IntimidationProficiency,
            MedicineProficiency: page.MedicineProficiency,
            NatureProficiency: page.NatureProficiency,
            OccultismProficiency: page.OccultismProficiency,
            PerformanceProficiency: page.PerformanceProficiency,
            ReligionProficiency: page.ReligionProficiency,
            SocietyProficiency: page.SocietyProficiency,
            StealthProficiency: page.StealthProficiency,
            SurvivalProficiency: page.SurvivalProficiency,
            ThieveryProficiency: page.ThieveryProficiency,
        };
    }

    getOverviewFields(args) {
        const { path, dv } = args;
        const page = dv.page(path);

        return {
            AncestryHP: page.AncestryHP,
            Size: page.Size,
            Speed: page.Speed,
            ClassHP: page.ClassHP,
        };
    }

    getDefenseFields(args) {
        const { path, dv } = args;
        const page = dv.page(path);

        return {
            ItemBonus: page.ItemBonus,
            Proficiency: page.Proficiency,
            DexterityModCap: page.DexterityModCap,
        };
    }

    renderSkills(args) {
        const { dv, abilities, proficiencies, level } = args;

        const skills = Object.entries(Pathfinder.SKILLS)
            .map(([key, value]) => {
                const { mod, proficiency } = value;
                const modValue = abilities[mod];

                const proficiencyValue = this.getProficiency({
                    proficiency: proficiencies[proficiency],
                    level,
                });

                const skillValue = modValue + proficiencyValue;

                return `[${key}:: ${skillValue}]`;
            });

        dv.list(skills);
    }

    renderStats(args) {
        const { dv, overviewFields, abilities, defenseFields, level } = args;

        const dexMod = Math.min(defenseFields.DexterityModCap, abilities.DexterityMod);
        const normalizedDexMod = Math.max(0, dexMod);

        const proficiency = this.getProficiency({
            proficiency: defenseFields.Proficiency,
            level,
        });

        const stats = {
            Health: level * overviewFields.AncestryHP + overviewFields.ClassHP + abilities.ConstitutionMod,
            ArmorClass: 10 + defenseFields.ItemBonus + proficiency + normalizedDexMod,
            Speed: overviewFields.Speed,
            Size: overviewFields.Size,
        };

        this.renderList({ dv, object: stats });
    }

    renderList(args) {
        const { dv, object } = args;

        const list = Object
            .entries(object)
            .map(([key, value]) => {
                return `[${key}:: ${value}]`;
            });

        dv.list(list);
    }

    getProficiency(args) {
        const { proficiency, level } = args;

        if (proficiency === 0) {
            return 0;
        }

        return proficiency + level;
    }
}
