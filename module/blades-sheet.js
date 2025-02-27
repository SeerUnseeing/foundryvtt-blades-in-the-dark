/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class BladesSheet extends ActorSheet {

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-add-popup").click(this._onItemAddClick.bind(this));
    html.find(".update-box").click(this._onUpdateBoxClick.bind(this));

    // Post item to chat
    html.find(".item-post").click((ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sendToChat();
    });

    // This is a workaround until is being fixed in FoundryVTT.
    if ( this.options.submitOnChange ) {
      html.on("change", "textarea", this._onChangeInput.bind(this));  // Use delegated listener on the form
    }

    html.find(".roll-die-attribute").click(this._onRollAttributeDieClick.bind(this));
  }

  /* -------------------------------------------- */

  async _onItemAddClick(event) {
    event.preventDefault();
    const item_type = $(event.currentTarget).data("itemType")
    const distinct = $(event.currentTarget).data("distinct")
    
    let items = await BladesHelpers.getAllItemsByType(item_type, game);

    let html = await renderTemplate("systems/battendown-drop/templates/add-item.html",{items: items, distinct : distinct})

    let options = {
      // width: "500"
    }
    console.log(item_type)
    let dialog = new Dialog({
      title: game.i18n.format('BITD.Add', {type : item_type.capitalize()}), //TODO: Make sure that the item type is getting properly localized here.
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('BITD.AddButton'),
          callback: async (html) => await this.addItemsToSheet(item_type, $(html).find('.items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('BITD.Cancel'),
          callback: () => false
        }
      },
      default: "two"
    }, options);

    dialog.render(true);
  }

  /* -------------------------------------------- */

  async addItemsToSheet(item_type, el) {

    let items = await BladesHelpers.getAllItemsByType(item_type, game);
    let items_to_add = [];

    el.find("input:checked").each(function() {
      items_to_add.push(items.find(e => e._id === $(this).val()));
    });

    await Item.create(items_to_add, {parent: this.document});
  }
  /* -------------------------------------------- */

  /**
   * Roll an Attribute die.
   * @param {*} event
   */
  async _onRollAttributeDieClick(event) {

    const attribute_name = $(event.currentTarget).data("rollAttribute");
    this.actor.rollAttributePopup(attribute_name);

  }

  /* -------------------------------------------- */

  async _onUpdateBoxClick(event) {
    event.preventDefault();
    const item_id = $(event.currentTarget).data("item");
    var update_value = $(event.currentTarget).data("value");
      const update_type = $(event.currentTarget).data("utype");
      if ( update_value === undefined) {
      update_value = document.getElementById('fac-' + update_type + '-' + item_id).value;
    };
    var update;
    if ( update_type === "status" ) {
      update = {_id: item_id, system:{status:{value: update_value}}};
    }
    else if (update_type == "hold") {
      update = {_id: item_id, system:{hold:{value: update_value}}};
    } else {
      console.log("update attempted for type undefined in blades-sheet.js onUpdateBoxClick function");
      return;
    };

    await this.actor.updateEmbeddedDocuments("Item", [update]);


    }

  /* -------------------------------------------- */

}