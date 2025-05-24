const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Cria uma mensagem embed personalizada')
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('Título do embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('descricao')
                .setDescription('Descrição do embed (use \\n para quebras de linha)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('cor')
                .setDescription('Cor do embed (hexadecimal, ex: #0099ff)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('imagem')
                .setDescription('URL de uma imagem ou GIF para o embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Texto do rodapé do embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('botoes')
                .setDescription('Botões no formato JSON (ex: [{\"label\":\"Texto\",\"url\":\"https://link\"}])')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Selecione o canal onde a mensagem será enviada')
                .addChannelTypes(ChannelType.GuildText) // Apenas canais de texto
                .setRequired(false)), // Tornar opcional para fallback no canal atual

    async execute(interaction) {
        try {
            // Obtém os valores das opções
            const titulo = interaction.options.getString('titulo');
            let descricao = interaction.options.getString('descricao');
            const cor = interaction.options.getString('cor') || '#0099ff';
            const imagem = interaction.options.getString('imagem');
            const footer = interaction.options.getString('footer') || 'Rodapé padrão';
            let botoes = interaction.options.getString('botoes') || '';
            const canal = interaction.options.getChannel('canal') || interaction.channel; // Fallback no canal atual

            // Substitui as quebras de linha '\\n' por '\n' para as descrições
            descricao = descricao.replace(/\\n/g, '\n');

            // Verificação da cor hexadecimal
            const isValidHexColor = /^#[0-9A-Fa-f]{6}$/i.test(cor);
            if (!isValidHexColor) {
                await interaction.reply({
                    content: 'A cor fornecida não é válida. Certifique-se de usar um formato hexadecimal válido (ex: #0099ff).',
                    ephemeral: true,
                });
                return;
            }

            // Cria o embed
            const embed = new EmbedBuilder()
                .setTitle(titulo)
                .setDescription(descricao)
                .setColor(cor)
                .setTimestamp();

            // Valida e adiciona a imagem ou GIF, se fornecida
            if (imagem) {
                const isValidUrl = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(imagem);
                if (isValidUrl) {
                    embed.setImage(imagem);
                } else {
                    await interaction.reply({
                        content: 'A URL fornecida para a imagem ou GIF não é válida. Certifique-se de que seja um link direto para um arquivo de imagem ou GIF (ex.: termina em .png, .jpg, .gif, etc.).',
                        ephemeral: true,
                    });
                    return;
                }
            }

            // Adiciona o footer, se fornecido
            if (footer) embed.setFooter({ text: footer });

            // Cria os botões, se fornecidos
            let components = [];
            if (botoes) {
                try {
                    const parsedButtons = JSON.parse(botoes);

                    if (Array.isArray(parsedButtons) && parsedButtons.length > 0) {
                        const actionRow = new ActionRowBuilder();
                        for (const btn of parsedButtons) {
                            if (btn.label && btn.url && /^(https?:\/\/)/i.test(btn.url)) {
                                const button = new ButtonBuilder()
                                    .setLabel(btn.label)
                                    .setStyle(ButtonStyle.Link)
                                    .setURL(btn.url);

                                if (btn.emoji) {
                                    button.setEmoji(btn.emoji);
                                }

                                if (btn.cor) {
                                    switch (btn.cor.toLowerCase()) {
                                        case 'primary':
                                            button.setStyle(ButtonStyle.Primary);
                                            break;
                                        case 'secondary':
                                            button.setStyle(ButtonStyle.Secondary);
                                            break;
                                        case 'success':
                                            button.setStyle(ButtonStyle.Success);
                                            break;
                                        case 'danger':
                                            button.setStyle(ButtonStyle.Danger);
                                            break;
                                        default:
                                            button.setStyle(ButtonStyle.Link);
                                    }
                                }

                                actionRow.addComponents(button);
                            } else {
                                await interaction.reply({
                                    content: 'Um ou mais botões fornecidos possuem informações inválidas. Certifique-se de que cada botão tenha um label, URL e emoji válidos.',
                                    ephemeral: true,
                                });
                                return;
                            }
                        }
                        components.push(actionRow);
                    } else {
                        await interaction.reply({
                            content: 'O formato dos botões está errado. Certifique-se de passar um array de botões no formato correto.',
                            ephemeral: true,
                        });
                        return;
                    }
                } catch (err) {
                    await interaction.reply({
                        content: 'O formato dos botões é inválido. Use um JSON no formato: [{"label":"Texto","url":"https://link","emoji":"emoji_id_ou_emoji_comum","cor":"cor_do_botao"}]',
                        ephemeral: true,
                    });
                    return;
                }
            }

            // Envia o embed no canal selecionado
            await canal.send({ embeds: [embed], components });
            await interaction.reply({
                content: `Mensagem enviada no canal ${canal}!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Erro ao criar embed:', error);
            await interaction.reply({
                content: 'Houve um erro inesperado ao criar o embed. Por favor, tente novamente mais tarde.',
                ephemeral: true,
            });
        }
    },
};