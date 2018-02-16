import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {BotConfig, BotConfigHttpDataService} from '../model/bot-config';

/**
 * Template-driven version of the Settings form.
 *
 * @author gazbert
 */
@Component({
    selector: 'app-bxbot-ui-settings',
    templateUrl: 'settings.component.html',
    styleUrls: ['settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewChecked {

    bots: BotConfig[] = [];
    deletedBots: BotConfig[] = [];
    botId;
    active = true;

    botsForm: NgForm;
    @ViewChild('botsForm') currentForm: NgForm;

    formErrors = {};

    validationMessages = {
        'botId': {
            'required': 'Bot Id is required.',
            'maxlength': 'Bot Id max length is 50 characters.',
            'pattern': 'Bot Id must be alphanumeric and can only include the following special characters: _ -',
            'duplicateId': 'Bot Id already in use. Please choose another.'
        },
        'alias': {
            'required': 'Alias is required.',
            'maxlength': 'Alias max length is 50 characters.',
            'pattern': 'Alias must be alphanumeric and can only include the following special characters: _ -',
            'duplicateAlias': 'Alias already in use. Please choose another.'
        },
        'baseUrl': {
            'required': 'Base URL is required.',
            'maxlength': 'Base URL max length is 100 characters.',
            'pattern': 'Base URL must be alphanumeric and can only include the following special characters: _ -',
            'duplicateId': 'Bot Id already in use. Please choose another.'
        },
        'strategyDescription': {
            'maxlength': 'Description max length is 120 characters.'
        },
        'strategyClassname': {
            'required': 'Class Name is required.',
            'maxlength': 'Class Name max length is 50 characters.',
            'pattern': 'Class Name must be valid Java class, e.g. com.my.MyTradingStrategyClass'
        },
        'strategyConfigItemName': {
            'required': 'Name is required.',
            'maxlength': 'Name max length is 50 characters.',
            'pattern': 'Name must be alphanumeric and can only include the following special characters: _ -'
        },
        'strategyConfigItemValue': {
            'required': 'Value is required.',
            'maxlength': 'Value max length is 120 characters.'
        }
    };

    errorModal = {
        'title': 'Strategy Still In Use',
        'body': 'You cannot delete this Strategy because it is still being used by a Market on the Exchange. ' +
        'Please check your Market configuration.'
    };

    constructor(private botConfigDataService: BotConfigHttpDataService, private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            this.botId = params['id'];
            this.botConfigDataService.getAllBotConfig()
                .then(bots => {
                    this.bots = bots;
                    this.updateFormErrors();
                });
        }).then(() => {/*done*/});
    }

    addBot(): void {
        // this.bots.push(new Strategy(this.createUuid(), this.botId, null, null, null, new OptionalConfig([])));
        this.updateFormErrors();
    }

    deleteBot(bot: BotConfig): void {
        // this.marketDataService.getAllMarketsForBotId(this.botId)
        //     .then((markets) => {
        //         const marketsUsingTheStrategy = markets.filter(m => m.strategy.id === strategy.id);
        //         if (marketsUsingTheStrategy.length > 0) {
        //             this.showCannotDeleteStrategyModal();
        //         } else {
        //             this.bots = this.bots.filter(s => s.id !== strategy.id);
        //             this.deletedBots.push(strategy);
        //             this.updateFormErrors();
        //         }
        //     });
    }

    save(isValid: boolean): void {
        if (isValid) {
            this.deletedBots.forEach((bot) => {
                this.botConfigDataService.deleteBotConfigById(this.botId).then(() => {/*done*/
                });
            });

            // TODO - Be more efficient: only update Bots that have changed
            this.bots.forEach((bot) => {
                this.botConfigDataService.updateBotConfig(this.botId, bot)
                    .then(() => this.goToDashboard());
            });
        } else {
            this.onValueChanged(); // force validation for new untouched bots
        }
    }

    cancel() {
        this.goToDashboard();
    }

    goToDashboard() {
        this.router.navigate(['dashboard']);
    }

    canBeDeleted() {
        return this.bots.length > 1;
    }

    // showCannotDeleteStrategyModal(): void {
    //     this.canDeleteStrategy = false;
    // }

    // hideCannotDeleteStrategyModal(): void {
    //     this.canDeleteStrategy = true;
    // }

    // addOptionalConfigItem(strategy: Strategy): void {
    //     strategy.optionalConfig.configItems.push(new ConfigItem('', ''));
    //     this.updateFormErrors();
    // }

    // deleteOptionalConfigItem(selectedStrategy: Strategy, configItem: ConfigItem): void {
    //     this.bots.forEach((s) => {
    //         if (s.id === selectedStrategy.id) {
    //             s.optionalConfig.configItems = s.optionalConfig.configItems.filter(c => c !== configItem);
    //         }
    //     });
    //     this.updateFormErrors();
    // }

    // TODO - Only here temporarily for use with angular-in-memory-web-api until server side wired up.
    // Server will create UUID and return in POST response object.
    // Algo by @Broofa - http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/2117523#2117523
    createUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            // tslint:disable-next-line
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    updateFormErrors(): void {
        for (let i = 0; i < this.bots.length; i++) {
            this.formErrors['botId_' + i] = '';
            this.formErrors['alias_' + i] = '';
            this.formErrors['baseUrl_' + i] = '';
        }
    }

    /**
     * Need this because we iterate over primitive arrays for errorCode and errorMessage:
     * https://stackoverflow.com/questions/42322968/angular2-dynamic-input-field-lose-focus-when-input-changes
     */
    trackByIndex(index: any, item: any) {
        return index;
    }

    // ------------------------------------------------------------------------
    // Form validation
    // TODO - Move into new shared validation component
    // ------------------------------------------------------------------------

    ngAfterViewChecked() {
        this.formChanged();
    }

    formChanged() {

        if (this.currentForm === this.botsForm) {
            return;
        }

        this.botsForm = this.currentForm;
        if (this.botsForm) {
            this.botsForm.valueChanges
                .subscribe(data => this.onValueChanged(data));
        }
    }

    onValueChanged(data?: any) {

        if (!this.botsForm) {
            return;
        }

        const form = this.botsForm.form;

        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);

                // 1st condition validates existing strat; 2nd condition validates new strat.
                if ((control && control.dirty && !control.valid) ||
                    (control && control.pristine && !control.valid && this.botsForm.submitted)) {
                    const messages = this.validationMessages[field.substring(0, field.indexOf('_'))];
                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }
}
